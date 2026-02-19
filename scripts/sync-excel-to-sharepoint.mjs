/**
 * scripts/sync-excel-to-sharepoint.mjs
 *
 * Sube (upsert) categorías y productos desde un Excel a listas de SharePoint (Microsoft Graph).
 *
 * Requisitos (env, por defecto lee .env.imports):
 *   TENANT_ID, CLIENT_ID, CLIENT_SECRET
 *   SHAREPOINT_SITE_ID
 *   SP_LIST_CATEGORIES_ID
 *   SP_LIST_PRODUCTS_ID
 *
 * Opcionales:
 *   EXCEL_FILE (si no pasas --file)
 *   SHEET_CATEGORIES (default: Categorias)
 *   SHEET_PRODUCTS  (default: Productos)
 *   SITE_BASE_URL   (para normalizar URLs relativas o anchors "#...")
 *   DRY_RUN=1       (no escribe, solo muestra payloads)
 *
 * Uso:
 *   node scripts/sync-excel-to-sharepoint.mjs --file=./categorias_productos_template.xlsx --dry-run
 *   node scripts/sync-excel-to-sharepoint.mjs --file=./categorias_productos_template.xlsx --only=categories
 *   node scripts/sync-excel-to-sharepoint.mjs --file=./categorias_productos_template.xlsx --only=products
 *
 * Dependencias:
 *   npm i -D exceljs dotenv @azure/identity @microsoft/microsoft-graph-client isomorphic-fetch
 */

import dotenv from "dotenv";
import ExcelJS from "exceljs";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { ClientSecretCredential } from "@azure/identity";

dotenv.config({ path: ".env.imports" });

// ---------------- CLI ----------------
const argv = process.argv.slice(2);
function arg(name) {
  const p = argv.find((a) => a.startsWith(`--${name}=`));
  return p ? p.split("=").slice(1).join("=") : undefined;
}
const FILE = arg("file") || process.env.EXCEL_FILE;
const ONLY = (arg("only") || "").toLowerCase(); // "categories" | "products" | ""
const FORCE = argv.includes("--force"); // permite sobreescribir con vacío (no recomendado)
const DRY = argv.includes("--dry-run") || process.env.DRY_RUN === "1";

if (!FILE) {
  console.error("Falta --file=... o EXCEL_FILE en env.");
  process.exit(1);
}

// -------------- ENV ------------------
const {
  TENANT_ID,
  CLIENT_ID,
  CLIENT_SECRET,
  SHAREPOINT_SITE_ID,
  SP_LIST_CATEGORIES_ID,
  SP_LIST_PRODUCTS_ID,
  SHEET_CATEGORIES = "Categorias",
  SHEET_PRODUCTS = "Productos",
  SITE_BASE_URL = "",
} = process.env;

const REQUIRED = [
  "TENANT_ID",
  "CLIENT_ID",
  "CLIENT_SECRET",
  "SHAREPOINT_SITE_ID",
  "SP_LIST_CATEGORIES_ID",
  "SP_LIST_PRODUCTS_ID",
];

for (const k of REQUIRED) {
  if (!process.env[k]) console.error(`Missing env var: ${k}`);
}
if (REQUIRED.some((k) => !process.env[k])) process.exit(1);

// -------------- Graph client ----------
function buildGraphClient() {
  const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
  const scope = "https://graph.microsoft.com/.default";

  return Client.init({
    authProvider: async (done) => {
      try {
        const token = await credential.getToken(scope);
        done(null, token.token);
      } catch (e) {
        done(e, null);
      }
    },
  });
}
const graph = buildGraphClient();

// -------------- Helpers ---------------
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry(fn, { tries = 6 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const status = e?.statusCode || e?.status;
      const retryAfter = Number(e?.response?.headers?.get?.("retry-after") || 0);
      const waitMs = retryAfter ? retryAfter * 1000 : 500 * Math.pow(2, i);
      if (status === 429 || status === 503) {
        await sleep(waitMs);
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

function escapeOdataString(s) {
  return String(s).replaceAll("'", "''");
}

function normalizeUrl(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";

  if (s.startsWith("#")) {
    const base = String(SITE_BASE_URL || "").replace(/\/+$/, "");
    return base ? `${base}/${s}`.replace("/#", "#") : "";
  }
  if (s.startsWith("/")) {
    const base = String(SITE_BASE_URL || "").replace(/\/+$/, "");
    return base ? `${base}${s}` : "";
  }
  if (/^https?:\/\//i.test(s)) return s;

  return "";
}

function toUrlField(url, description = "") {
  const normalized = normalizeUrl(url);
  if (!normalized) return undefined;
  return { Url: normalized, Description: String(description || "") };
}

function cellToPrimitive(v) {
  if (v == null) return undefined;
  if (typeof v === "object") {
    if (v.text) return String(v.text);
    if (v.richText) return v.richText.map((r) => r.text).join("");
    if (v.hyperlink) return String(v.hyperlink);
    if (v.formula && v.result != null) return v.result;
  }
  return v;
}

function asString(v) {
  const x = cellToPrimitive(v);
  if (x == null) return undefined;
  const s = String(x).trim();
  return s ? s : undefined;
}

function asNumber(v) {
  const x = cellToPrimitive(v);
  if (x == null || x === "") return undefined;
  const n = Number(x);
  return Number.isFinite(n) ? n : undefined;
}

function asBool(v) {
  const x = cellToPrimitive(v);
  if (x == null) return undefined;
  if (typeof x === "boolean") return x;
  const s = String(x).trim().toLowerCase();
  if (!s) return undefined;
  if (["1", "true", "yes", "y", "si", "sí"].includes(s)) return true;
  if (["0", "false", "no", "n"].includes(s)) return false;
  return undefined;
}

function jsonStringify(v, fallback = "[]") {
  const x = cellToPrimitive(v);
  if (x == null || x === "") return fallback;
  if (typeof x === "string") {
    const s = x.trim();
    if (!s) return fallback;
    try {
      JSON.parse(s);
      return s;
    } catch {
      return JSON.stringify([s]);
    }
  }
  try {
    return JSON.stringify(x);
  } catch {
    return fallback;
  }
}

function cleanUndefined(obj) {
  for (const k of Object.keys(obj)) {
    if (obj[k] === undefined) delete obj[k];
  }
  return obj;
}

function normalizeHeaderName(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, "");
}

function buildHeaderIndexMap(ws) {
  const headerRow = ws.getRow(1);
  const map = new Map();
  headerRow.eachCell((cell, colNumber) => {
    const key = normalizeHeaderName(cellToPrimitive(cell.value));
    if (key) map.set(key, colNumber);
  });
  return map;
}

function col(headerMap, names) {
  for (const n of names) {
    const idx = headerMap.get(normalizeHeaderName(n));
    if (idx) return idx;
  }
  return null;
}

async function findItemIdByField(listId, fieldInternalName, value) {
  const q =
    `/sites/${SHAREPOINT_SITE_ID}/lists/${listId}/items` +
    `?$expand=fields($select=${fieldInternalName})` +
    `&$filter=fields/${fieldInternalName} eq '${escapeOdataString(value)}'`;

  const res = await withRetry(() => graph.api(q).get());
  return res?.value?.[0]?.id || null;
}

async function upsertListItem(listId, keyField, keyValue, fields, labelForLogs) {
  const existingId = await findItemIdByField(listId, keyField, keyValue);

  // importante para campos URL
  const request = (apiPath) => graph.api(apiPath).header("Prefer", "apiversion=2.1");

  if (DRY) {
    console.log(`[DRY_RUN] ${labelForLogs} =>`, { keyField, keyValue, fields });
    return { dryRun: true };
  }

  if (!existingId) {
    return await withRetry(() =>
      request(`/sites/${SHAREPOINT_SITE_ID}/lists/${listId}/items`).post({ fields })
    );
  }

  await withRetry(() =>
    request(`/sites/${SHAREPOINT_SITE_ID}/lists/${listId}/items/${existingId}/fields`).patch(fields)
  );

  return { id: existingId, updated: true };
}

// -------------- Mapping ---------------
// Si tus nombres internos de columnas en SharePoint difieren, ajusta aquí.
const SP_FIELDS = {
  cat: {
    Title: "Title",
    CategorySlug: "CategorySlug",
    NavLabel: "NavLabel",
    SortOrder: "SortOrder",
    ParentSlug: "ParentSlug",
    IsFeatured: "IsFeatured",
    IsHidden: "IsHidden",
    IsPublished: "IsPublished",
    Description: "Description",
    BodyMd: "BodyMd",
    TabsJson: "TabsJson",
    ImageSrc: "ImageSrc",
    ImageWidth: "ImageWidth",
    ImageHeight: "ImageHeight",
    ImageAlt: "ImageAlt",
    GalleryImagesJson: "GalleryImagesJson",
    BreadcrumbsJson: "BreadcrumbsJson",
    CtaText: "CtaText",
    CtaLink: "CtaLink",
    MetaTitle: "MetaTitle",
    MetaDescription: "MetaDescription",
    Canonical: "Canonical",
    HrefLangJson: "HrefLangJson",
    KeywordsJson: "KeywordsJson",
    SearchTermsJson: "SearchTermsJson",
    FaqsJson: "FaqsJson",
    SchemaJson: "SchemaJson",
  },
  prod: {
    Title: "Title",
    ProductSlug: "ProductSlug",
    CategorySlug: "CategorySlug",
    IsPublished: "IsPublished",
    ShortDescription: "ShortDescription",
    BodyMd: "BodyMd",
    ImageSrc: "ImageSrc",
    ImageWidth: "ImageWidth",
    ImageHeight: "ImageHeight",
    ImageAlt: "ImageAlt",
    GalleryImagesJson: "GalleryImagesJson",
    Sku: "Sku",
    Mpn: "Mpn",
    Gtin13: "Gtin13",
    Brand: "Brand",
    Price: "Price",
    PriceCurrency: "PriceCurrency",
    InStock: "InStock",
    RatingValue: "RatingValue",
    ReviewCount: "ReviewCount",
    AttributesJson: "AttributesJson",
    VariantsJson: "VariantsJson",
    FormFieldsJson: "FormFieldsJson",
    MetaTitle: "MetaTitle",
    MetaDescription: "MetaDescription",
    Canonical: "Canonical",
    HrefLangJson: "HrefLangJson",
    KeywordsJson: "KeywordsJson",
    SearchTermsJson: "SearchTermsJson",
    SchemaJson: "SchemaJson",
  },
};

function mapCategoryRow(headerMap, row) {
  // soporta headers del export (CategorySlug/BodyMd/...) y del template (slug/body/...)
  const cSlug = col(headerMap, ["CategorySlug", "slug", "Slug"]);
  const cTitle = col(headerMap, ["Title", "title", "Titulo", "título"]);
  const cNav = col(headerMap, ["NavLabel", "navLabel", "nav", "Nav"]);
  const cParent = col(headerMap, ["ParentSlug", "parentSlug", "parent"]);
  const cOrder = col(headerMap, ["SortOrder", "sortOrder", "order"]);
  const cFeatured = col(headerMap, ["IsFeatured", "featured"]);
  const cHidden = col(headerMap, ["IsHidden", "hidden"]);
  const cPublished = col(headerMap, ["IsPublished", "published"]);
  const cDesc = col(headerMap, ["Description", "description"]);
  const cBody = col(headerMap, ["BodyMd", "body", "Body"]);
  const cTabs = col(headerMap, ["TabsJson", "tabsJson"]);
  const cImg = col(headerMap, ["ImageSrc", "imageSrc", "image"]);
  const cImgAlt = col(headerMap, ["ImageAlt", "imageAlt", "alt"]);
  const cImgW = col(headerMap, ["ImageWidth", "imageWidth", "width"]);
  const cImgH = col(headerMap, ["ImageHeight", "imageHeight", "height"]);
  const cMetaT = col(headerMap, ["MetaTitle", "metaTitle"]);
  const cMetaD = col(headerMap, ["MetaDescription", "metaDescription"]);
  const cCanon = col(headerMap, ["Canonical", "canonical"]);
  const cBread = col(headerMap, ["BreadcrumbsJson", "breadcrumbsJson"]);
  const cGallery = col(headerMap, ["GalleryImagesJson", "galleryImagesJson"]);
  const cCtaText = col(headerMap, ["CtaText", "ctaText"]);
  const cCtaLink = col(headerMap, ["CtaLink", "ctaLink"]);
  const cHref = col(headerMap, ["HrefLangJson", "hreflang", "hreflangJson"]);
  const cKeys = col(headerMap, ["KeywordsJson", "keywords", "keywordsJson"]);
  const cSearch = col(headerMap, ["SearchTermsJson", "searchTerms", "searchTermsJson"]);
  const cFaqs = col(headerMap, ["FaqsJson", "faqs", "faqsJson"]);
  const cSchema = col(headerMap, ["SchemaJson", "schema", "schemaJson"]);

  const slug = cSlug ? asString(row.getCell(cSlug).value) : undefined;
  if (!slug) return null;

  const title = cTitle ? asString(row.getCell(cTitle).value) : slug;
  const navLabel = (cNav ? asString(row.getCell(cNav).value) : undefined) || title || slug;

  const imageUrl = cImg ? asString(row.getCell(cImg).value) : undefined;
  const imageAlt = (cImgAlt ? asString(row.getCell(cImgAlt).value) : undefined) || title || slug;

  const fields = {
    [SP_FIELDS.cat.Title]: title || slug,
    [SP_FIELDS.cat.CategorySlug]: slug,
    [SP_FIELDS.cat.NavLabel]: navLabel,
    ...(cOrder ? { [SP_FIELDS.cat.SortOrder]: asNumber(row.getCell(cOrder).value) ?? 0 } : {}),
    ...(cParent ? { [SP_FIELDS.cat.ParentSlug]: asString(row.getCell(cParent).value) || "" } : {}),

    ...(cFeatured ? { [SP_FIELDS.cat.IsFeatured]: asBool(row.getCell(cFeatured).value) ?? false } : {}),
    ...(cHidden ? { [SP_FIELDS.cat.IsHidden]: asBool(row.getCell(cHidden).value) ?? false } : {}),
    ...(cPublished
      ? { [SP_FIELDS.cat.IsPublished]: asBool(row.getCell(cPublished).value) ?? true }
      : { [SP_FIELDS.cat.IsPublished]: true }),

    ...(cDesc ? { [SP_FIELDS.cat.Description]: asString(row.getCell(cDesc).value) || "" } : {}),
    ...(cBody ? { [SP_FIELDS.cat.BodyMd]: asString(row.getCell(cBody).value) || "" } : {}),
    ...(cTabs ? { [SP_FIELDS.cat.TabsJson]: asString(row.getCell(cTabs).value) || "" } : {}),

    ...(imageUrl ? { [SP_FIELDS.cat.ImageSrc]: toUrlField(imageUrl, imageAlt) } : {}),
    ...(cImgW ? { [SP_FIELDS.cat.ImageWidth]: asNumber(row.getCell(cImgW).value) } : {}),
    ...(cImgH ? { [SP_FIELDS.cat.ImageHeight]: asNumber(row.getCell(cImgH).value) } : {}),
    ...(cImgAlt ? { [SP_FIELDS.cat.ImageAlt]: imageAlt } : {}),

    ...(cGallery ? { [SP_FIELDS.cat.GalleryImagesJson]: jsonStringify(row.getCell(cGallery).value, "[]") } : {}),
    ...(cBread ? { [SP_FIELDS.cat.BreadcrumbsJson]: jsonStringify(row.getCell(cBread).value, "[]") } : {}),

    ...(cCtaText ? { [SP_FIELDS.cat.CtaText]: asString(row.getCell(cCtaText).value) || "" } : {}),
    ...(cCtaLink
      ? { [SP_FIELDS.cat.CtaLink]: toUrlField(asString(row.getCell(cCtaLink).value), cCtaText ? asString(row.getCell(cCtaText).value) || "" : "") }
      : {}),

    ...(cMetaT ? { [SP_FIELDS.cat.MetaTitle]: asString(row.getCell(cMetaT).value) || "" } : {}),
    ...(cMetaD ? { [SP_FIELDS.cat.MetaDescription]: asString(row.getCell(cMetaD).value) || "" } : {}),
    ...(cCanon ? { [SP_FIELDS.cat.Canonical]: asString(row.getCell(cCanon).value) || "" } : {}),

    ...(cHref ? { [SP_FIELDS.cat.HrefLangJson]: jsonStringify(row.getCell(cHref).value, "[]") } : {}),
    ...(cKeys ? { [SP_FIELDS.cat.KeywordsJson]: jsonStringify(row.getCell(cKeys).value, "[]") } : {}),
    ...(cSearch ? { [SP_FIELDS.cat.SearchTermsJson]: jsonStringify(row.getCell(cSearch).value, "[]") } : {}),
    ...(cFaqs ? { [SP_FIELDS.cat.FaqsJson]: jsonStringify(row.getCell(cFaqs).value, "[]") } : {}),
    ...(cSchema ? { [SP_FIELDS.cat.SchemaJson]: jsonStringify(row.getCell(cSchema).value, "{}") } : {}),
  };

  // si NO usas --force, evita machacar con vacíos
  if (!FORCE) {
    for (const k of Object.keys(fields)) {
      if (typeof fields[k] === "string" && fields[k].trim() === "") delete fields[k];
      if (fields[k] === undefined) delete fields[k];
    }
  }

  cleanUndefined(fields);
  return { slug, fields };
}

function mapProductRow(headerMap, row) {
  const cSlug = col(headerMap, ["ProductSlug", "slug", "Slug"]);
  const cTitle = col(headerMap, ["Title", "title", "Titulo", "título"]);
  const cCatSlug = col(headerMap, ["CategorySlug", "categorySlug", "category"]);
  const cPublished = col(headerMap, ["IsPublished", "published"]);
  const cDesc = col(headerMap, ["ShortDescription", "description", "Description"]);
  const cBody = col(headerMap, ["BodyMd", "body", "Body"]);
  const cImg = col(headerMap, ["ImageSrc", "imageSrc", "image"]);
  const cImgAlt = col(headerMap, ["ImageAlt", "imageAlt", "alt"]);
  const cImgW = col(headerMap, ["ImageWidth", "imageWidth", "width"]);
  const cImgH = col(headerMap, ["ImageHeight", "imageHeight", "height"]);
  const cGallery = col(headerMap, ["GalleryImagesJson", "galleryImagesJson"]);
  const cSku = col(headerMap, ["Sku", "sku"]);
  const cMpn = col(headerMap, ["Mpn", "mpn"]);
  const cGtin = col(headerMap, ["Gtin13", "gtin13", "gtin"]);
  const cBrand = col(headerMap, ["Brand", "brand"]);
  const cPrice = col(headerMap, ["Price", "price"]);
  const cCur = col(headerMap, ["PriceCurrency", "priceCurrency"]);
  const cStock = col(headerMap, ["InStock", "inStock"]);
  const cRating = col(headerMap, ["RatingValue", "ratingValue"]);
  const cReviews = col(headerMap, ["ReviewCount", "reviewCount"]);
  const cAttrs = col(headerMap, ["AttributesJson", "attributes", "attributesJson"]);
  const cVariants = col(headerMap, ["VariantsJson", "variants", "variantsJson"]);
  const cForm = col(headerMap, ["FormFieldsJson", "formFields", "formFieldsJson"]);
  const cMetaT = col(headerMap, ["MetaTitle", "metaTitle"]);
  const cMetaD = col(headerMap, ["MetaDescription", "metaDescription"]);
  const cCanon = col(headerMap, ["Canonical", "canonical"]);
  const cHref = col(headerMap, ["HrefLangJson", "hreflang", "hreflangJson"]);
  const cKeys = col(headerMap, ["KeywordsJson", "keywords", "keywordsJson"]);
  const cSearch = col(headerMap, ["SearchTermsJson", "searchTerms", "searchTermsJson"]);
  const cSchema = col(headerMap, ["SchemaJson", "schema", "schemaJson"]);

  const slug = cSlug ? asString(row.getCell(cSlug).value) : undefined;
  if (!slug) return null;

  const categorySlug = cCatSlug ? asString(row.getCell(cCatSlug).value) : undefined;
  if (!categorySlug) return { slug, skip: true, reason: "missing CategorySlug" };

  const title = cTitle ? asString(row.getCell(cTitle).value) : slug;
  const imageUrl = cImg ? asString(row.getCell(cImg).value) : undefined;
  const imageAlt = (cImgAlt ? asString(row.getCell(cImgAlt).value) : undefined) || title || slug;

  const fields = {
    [SP_FIELDS.prod.Title]: title || slug,
    [SP_FIELDS.prod.ProductSlug]: slug,
    [SP_FIELDS.prod.CategorySlug]: categorySlug,
    ...(cPublished ? { [SP_FIELDS.prod.IsPublished]: asBool(row.getCell(cPublished).value) ?? true } : { [SP_FIELDS.prod.IsPublished]: true }),

    ...(cDesc ? { [SP_FIELDS.prod.ShortDescription]: asString(row.getCell(cDesc).value) || "" } : {}),
    ...(cBody ? { [SP_FIELDS.prod.BodyMd]: asString(row.getCell(cBody).value) || "" } : {}),

    ...(imageUrl ? { [SP_FIELDS.prod.ImageSrc]: toUrlField(imageUrl, imageAlt) } : {}),
    ...(cImgW ? { [SP_FIELDS.prod.ImageWidth]: asNumber(row.getCell(cImgW).value) } : {}),
    ...(cImgH ? { [SP_FIELDS.prod.ImageHeight]: asNumber(row.getCell(cImgH).value) } : {}),
    ...(cImgAlt ? { [SP_FIELDS.prod.ImageAlt]: imageAlt } : {}),

    ...(cGallery ? { [SP_FIELDS.prod.GalleryImagesJson]: jsonStringify(row.getCell(cGallery).value, "[]") } : {}),

    ...(cSku ? { [SP_FIELDS.prod.Sku]: asString(row.getCell(cSku).value) || "" } : {}),
    ...(cMpn ? { [SP_FIELDS.prod.Mpn]: asString(row.getCell(cMpn).value) || "" } : {}),
    ...(cGtin ? { [SP_FIELDS.prod.Gtin13]: asString(row.getCell(cGtin).value) || "" } : {}),
    ...(cBrand ? { [SP_FIELDS.prod.Brand]: asString(row.getCell(cBrand).value) || "Repro Disseny" } : { [SP_FIELDS.prod.Brand]: "Repro Disseny" }),

    ...(cPrice ? (asNumber(row.getCell(cPrice).value) !== undefined ? { [SP_FIELDS.prod.Price]: asNumber(row.getCell(cPrice).value) } : {}) : {}),
    ...(cCur ? { [SP_FIELDS.prod.PriceCurrency]: asString(row.getCell(cCur).value) || "EUR" } : { [SP_FIELDS.prod.PriceCurrency]: "EUR" }),
    ...(cStock ? (asBool(row.getCell(cStock).value) !== undefined ? { [SP_FIELDS.prod.InStock]: asBool(row.getCell(cStock).value) } : {}) : {}),

    ...(cRating ? (asNumber(row.getCell(cRating).value) !== undefined ? { [SP_FIELDS.prod.RatingValue]: asNumber(row.getCell(cRating).value) } : {}) : {}),
    ...(cReviews ? (asNumber(row.getCell(cReviews).value) !== undefined ? { [SP_FIELDS.prod.ReviewCount]: asNumber(row.getCell(cReviews).value) } : {}) : {}),

    ...(cAttrs ? { [SP_FIELDS.prod.AttributesJson]: jsonStringify(row.getCell(cAttrs).value, "[]") } : {}),
    ...(cVariants ? { [SP_FIELDS.prod.VariantsJson]: jsonStringify(row.getCell(cVariants).value, "[]") } : {}),
    ...(cForm ? { [SP_FIELDS.prod.FormFieldsJson]: jsonStringify(row.getCell(cForm).value, "[]") } : {}),

    ...(cMetaT ? { [SP_FIELDS.prod.MetaTitle]: asString(row.getCell(cMetaT).value) || "" } : {}),
    ...(cMetaD ? { [SP_FIELDS.prod.MetaDescription]: asString(row.getCell(cMetaD).value) || "" } : {}),
    ...(cCanon ? { [SP_FIELDS.prod.Canonical]: asString(row.getCell(cCanon).value) || "" } : {}),

    ...(cHref ? { [SP_FIELDS.prod.HrefLangJson]: jsonStringify(row.getCell(cHref).value, "[]") } : {}),
    ...(cKeys ? { [SP_FIELDS.prod.KeywordsJson]: jsonStringify(row.getCell(cKeys).value, "[]") } : {}),
    ...(cSearch ? { [SP_FIELDS.prod.SearchTermsJson]: jsonStringify(row.getCell(cSearch).value, "[]") } : {}),
    ...(cSchema ? { [SP_FIELDS.prod.SchemaJson]: jsonStringify(row.getCell(cSchema).value, "{}") } : {}),
  };

  if (!FORCE) {
    for (const k of Object.keys(fields)) {
      if (typeof fields[k] === "string" && fields[k].trim() === "") delete fields[k];
      if (fields[k] === undefined) delete fields[k];
    }
  }

  cleanUndefined(fields);
  return { slug, fields, categorySlug };
}

// -------------- Runner ----------------
async function syncSheetCategories(wb) {
  const ws = wb.getWorksheet(SHEET_CATEGORIES);
  if (!ws) {
    console.warn(`No encuentro la hoja de categorías "${SHEET_CATEGORIES}". La salto.`);
    return;
  }
  const headerMap = buildHeaderIndexMap(ws);

  let ok = 0, skipped = 0;
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const mapped = mapCategoryRow(headerMap, row);
    if (!mapped) { skipped++; continue; }

    const { slug, fields } = mapped;
    if (!fields?.[SP_FIELDS.cat.NavLabel]) {
      console.warn(`Skip category ${slug}: NavLabel requerido`);
      skipped++;
      continue;
    }

    const res = await upsertListItem(
      SP_LIST_CATEGORIES_ID,
      "CategorySlug",
      slug,
      fields,
      `Category ${slug}`
    );
    console.log(`Category ${slug}:`, res?.id || "ok");
    ok++;
  }
  console.log(`CATEGORIES: ok=${ok} skipped=${skipped}`);
}

async function syncSheetProducts(wb) {
  const ws = wb.getWorksheet(SHEET_PRODUCTS);
  if (!ws) {
    console.warn(`No encuentro la hoja de productos "${SHEET_PRODUCTS}". La salto.`);
    return;
  }
  const headerMap = buildHeaderIndexMap(ws);

  let ok = 0, skipped = 0;
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const mapped = mapProductRow(headerMap, row);
    if (!mapped) { skipped++; continue; }
    if (mapped.skip) {
      console.warn(`Skip product ${mapped.slug}: ${mapped.reason} (row ${r})`);
      skipped++;
      continue;
    }

    const { slug, fields } = mapped;

    const res = await upsertListItem(
      SP_LIST_PRODUCTS_ID,
      "ProductSlug",
      slug,
      fields,
      `Product ${slug}`
    );
    console.log(`Product ${slug}:`, res?.id || "ok");
    ok++;
  }
  console.log(`PRODUCTS: ok=${ok} skipped=${skipped}`);
}

async function run() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FILE);

  console.log(`Excel loaded: ${FILE}`);
  console.log(`DRY_RUN=${DRY ? "1" : "0"} FORCE=${FORCE ? "1" : "0"} ONLY=${ONLY || "all"}`);

  if (!ONLY || ONLY === "categories" || ONLY === "cats") {
    await syncSheetCategories(wb);
  }
  if (!ONLY || ONLY === "products" || ONLY === "prods") {
    await syncSheetProducts(wb);
  }

  console.log("DONE");
}

run().catch((e) => {
  console.error("Import failed:", e?.message || e);
  process.exit(1);
});
