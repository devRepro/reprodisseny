import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import dotenv from "dotenv";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { ClientSecretCredential } from "@azure/identity";

dotenv.config({ path: ".env.imports" });

/**
 * ENV required:
 * TENANT_ID, CLIENT_ID, CLIENT_SECRET
 * SHAREPOINT_SITE_ID
 * SP_LIST_CATEGORIES_ID
 * SP_LIST_PRODUCTS_ID
 *
 * Optional:
 * CMS_DIR_CONTENT (default: content)
 * CMS_DIR_PRODUCTS (default: content/productos)
 * DRY_RUN=1
 */

const {
  TENANT_ID,
  CLIENT_ID,
  CLIENT_SECRET,
  SHAREPOINT_SITE_ID,
  SP_LIST_CATEGORIES_ID,
  SP_LIST_PRODUCTS_ID,
  CMS_DIR_CONTENT = "content",
  CMS_DIR_PRODUCTS = "content/productos",
  DRY_RUN,
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
  if (!process.env[k]) {
    console.error(`Missing env var: ${k}`);
  }
}
if (REQUIRED.some((k) => !process.env[k])) {
  process.exit(1);
}

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

function normalizeUrl(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";

  // Anchors "#..." => los convertimos a URL absoluta
  if (s.startsWith("#")) {
    const base = String(process.env.SITE_BASE_URL || "").replace(/\/+$/, "");
    return base ? `${base}/${s}`.replace("/#", "#") : ""; // si no hay base, lo omitimos
  }

  // Rutas relativas "/..." => absolutas con base
  if (s.startsWith("/")) {
    const base = String(process.env.SITE_BASE_URL || "").replace(/\/+$/, "");
    return base ? `${base}${s}` : "";
  }

  // Absolutas válidas http/https
  if (/^https?:\/\//i.test(s)) return s;

  // Cualquier otra cosa (ej: "productos") la descartamos
  return "";
}

function toUrlField(url, description = "") {
  const normalized = normalizeUrl(url);
  if (!normalized) return undefined;
  return { Url: normalized, Description: String(description || "") };
}


function asString(v) {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s ? s : undefined;
}

function asNumber(v) {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function asBool(v) {
  if (v == null) return undefined;
  return Boolean(v);
}

function jsonStringify(v, fallback = "[]") {
  if (v == null) return fallback;
  try {
    return JSON.stringify(v);
  } catch {
    return fallback;
  }
}

async function parseMdFile(file) {
  const raw = await fs.readFile(file, "utf8");
  const { data, content } = matter(raw);
  return { data, bodyMd: (content || "").trim(), file };
}

/**
 * Categorías:
 * - content/<catSlug>/index.md  => slug = catSlug, parentSlug = ""
 * - content/<catSlug>/<subSlug>/index.md => slug = subSlug, parentSlug = catSlug
 */
function categorySlugsFromPath(file) {
  const rel = path.relative(CMS_DIR_CONTENT, file);
  const parts = rel.split(path.sep);

  // parts ends with index.md
  // [catSlug, "index.md"] or [catSlug, subSlug, "index.md"]
  if (parts.length === 2) {
    return { slug: parts[0], parentSlug: "" };
  }
  if (parts.length === 3) {
    return { slug: parts[1], parentSlug: parts[0] };
  }
  // Si algún día creces a más niveles, aquí lo controlas
  return { slug: "", parentSlug: "" };
}

/** Map CATEGORY md -> SharePoint fields */
function mapCategoryToFields({ data, bodyMd, file }) {
  const fromPath = categorySlugsFromPath(file);

  // Respetamos frontmatter si existe; si no, usamos carpeta
  const slug = asString(data.slug) || fromPath.slug;
  const parentSlug = asString(data.parent) || fromPath.parentSlug;

  const title = asString(data.title) || slug;
  const navLabel = asString(data.nav) || title; // NavLabel en tu lista es REQUIRED :contentReference[oaicite:3]{index=3}

  const img = data.image || {};
  const imageAlt = asString(data.alt) || asString(img.alt) || title;


  const fields = {
    Title: title,
    CategorySlug: slug,
    NavLabel: navLabel,
    SortOrder: asNumber(data.order) ?? 0,
    ParentSlug: parentSlug || "",

    IsFeatured: asBool(data.featured) ?? false,
    IsHidden: asBool(data.hidden) ?? false,
    IsPublished: true,

    Description: asString(data.description) || "",
    BodyMd: bodyMd || "",

    // URL fields: IMPORTANT (Graph requiere objeto + Prefer apiversion=2.1) :contentReference[oaicite:5]{index=5}
    ImageSrc: toUrlField(img.src, imageAlt),
    ImageWidth: asNumber(img.width),
    ImageHeight: asNumber(img.height),
    ImageAlt: imageAlt,

    GalleryImagesJson: jsonStringify(data.galleryImages ?? []),
    BreadcrumbsJson: jsonStringify(data.breadcrumbs ?? []),

    CtaText: asString(data.cta?.text) || "",
    CtaLink: toUrlField(data.cta?.link, data.cta?.text || ""),

    MetaTitle: asString(data.metaTitle) || "",
    MetaDescription: asString(data.metaDescription) || "",
    Canonical: asString(data.canonical) || "",
    HrefLangJson: jsonStringify(data.hreflang ?? []),
    KeywordsJson: jsonStringify(data.keywords ?? []),
    SearchTermsJson: jsonStringify(data.searchTerms ?? []),
    FaqsJson: jsonStringify(data.faqs ?? []),
    SchemaJson: jsonStringify(data.schema ?? {}),
  };

  // Limpia undefined (Graph agradece payload limpio)
  for (const k of Object.keys(fields)) {
    if (fields[k] === undefined) delete fields[k];
  }

  return { slug, fields, file };
}

/** Map PRODUCT md -> SharePoint fields */
function mapProductToFields({ data, bodyMd, file }) {
  const slug = asString(data.slug) || path.basename(file, path.extname(file));
  const title = asString(data.title) || slug;

  const img = data.image || {};
  const imageAlt = asString(data.alt) || asString(img.alt) || title;

  const categorySlug = asString(data.categorySlug); // en tu plantilla es requerido

  const fields = {
    Title: title,
    ProductSlug: slug,

    CategorySlug: categorySlug || "",

    IsPublished: true,
    ShortDescription: asString(data.description) || "",
    BodyMd: bodyMd || "",

    ImageSrc: toUrlField(img.src, imageAlt),
    ImageWidth: asNumber(img.width),
    ImageHeight: asNumber(img.height),
    ImageAlt: imageAlt,

    GalleryImagesJson: jsonStringify(data.galleryImages ?? []),

    Sku: asString(data.sku) || "",
    Mpn: asString(data.mpn) || "",
    Gtin13: asString(data.gtin13) || "",
    Brand: asString(data.brand) || "Repro Disseny",

    // No fuerzo Price a 0: si no existe, lo omito
    ...(asNumber(data.price) !== undefined ? { Price: asNumber(data.price) } : {}),
    PriceCurrency: asString(data.priceCurrency) || "EUR",
    ...(data.inStock !== undefined ? { InStock: Boolean(data.inStock) } : {}),

    ...(asNumber(data.ratingValue) !== undefined ? { RatingValue: asNumber(data.ratingValue) } : {}),
    ...(asNumber(data.reviewCount) !== undefined ? { ReviewCount: asNumber(data.reviewCount) } : {}),

    AttributesJson: jsonStringify(data.attributes ?? []),
    VariantsJson: jsonStringify(data.variants ?? []),
    FormFieldsJson: jsonStringify(data.formFields ?? []),

    MetaTitle: asString(data.metaTitle) || "",
    MetaDescription: asString(data.metaDescription) || "",
    Canonical: asString(data.canonical) || "",
    HrefLangJson: jsonStringify(data.hreflang ?? []),
    KeywordsJson: jsonStringify(data.keywords ?? []),
    SearchTermsJson: jsonStringify(data.searchTerms ?? []),
    SchemaJson: jsonStringify(data.schema ?? {}),
  };

  for (const k of Object.keys(fields)) {
    if (fields[k] === undefined) delete fields[k];
  }

  return { slug, fields, file, categorySlug };
}

// retry throttling
async function withRetry(fn, { tries = 6 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const status = e?.statusCode || e?.status;
      const retryAfter = Number(e?.response?.headers?.get?.("retry-after") || 0);
      const waitMs = retryAfter ? retryAfter * 1000 : (500 * Math.pow(2, i));
      if (status === 429 || status === 503) {
        await new Promise((r) => setTimeout(r, waitMs));
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

  // Importante para URL fields: apiversion=2.1 :contentReference[oaicite:6]{index=6}
  const request = (apiPath) =>
    graph.api(apiPath).header("Prefer", "apiversion=2.1");

  if (DRY_RUN === "1") {
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

function isCategoryIndexFile(file) {
  // Excluye productos
  const rel = path.relative(CMS_DIR_CONTENT, file).replaceAll("\\", "/");
  if (rel.startsWith("productos/")) return false;
  // Solo index.md dentro de 1 o 2 niveles
  const parts = rel.split("/");
  return (
    (parts.length === 2 && parts[1] === "index.md") ||
    (parts.length === 3 && parts[2] === "index.md")
  );
}

async function run() {
  // 1) categorías/subcategorías
  const catFilesAll = await fg([`${CMS_DIR_CONTENT}/**/index.md`], { dot: false });
  const catFiles = catFilesAll.filter(isCategoryIndexFile);

  console.log(`Categories files: ${catFiles.length}`);

  for (const f of catFiles) {
    const parsed = await parseMdFile(f);
    const { slug, fields, file } = mapCategoryToFields(parsed);

    if (!slug) {
      console.warn(`Skip category (cannot resolve slug): ${file}`);
      continue;
    }
    if (!fields.NavLabel) {
      console.warn(`Skip category (NavLabel required): ${file}`);
      continue;
    }

    try {
      const res = await upsertListItem(
        SP_LIST_CATEGORIES_ID,
        "CategorySlug",
        slug,
        fields,
        `Category ${slug}`
      );
      console.log(`Category ${slug}:`, res?.id || "ok");
    } catch (e) {
      console.error(`Category FAILED: ${slug} | file=${file}`);
      console.error("Message:", e?.message || e);
      console.error("Status:", e?.statusCode || e?.status);
      // msgraph client a veces incluye body
      if (e?.body) console.error("Body:", e.body);
      throw e;
    }
  }

  // 2) productos
  const prodFiles = await fg([`${CMS_DIR_PRODUCTS}/*.md`], { dot: false });
  console.log(`Products files: ${prodFiles.length}`);

  for (const f of prodFiles) {
    const parsed = await parseMdFile(f);
    const { slug, fields, file, categorySlug } = mapProductToFields(parsed);

    if (!slug) {
      console.warn(`Skip product (cannot resolve slug): ${file}`);
      continue;
    }
    if (!categorySlug) {
      console.warn(`Skip product ${slug} missing categorySlug: ${file}`);
      continue;
    }

    try {
      const res = await upsertListItem(
        SP_LIST_PRODUCTS_ID,
        "ProductSlug",
        slug,
        fields,
        `Product ${slug}`
      );
      console.log(`Product ${slug}:`, res?.id || "ok");
    } catch (e) {
      console.error(`Product FAILED: ${slug} | file=${file}`);
      console.error("Message:", e?.message || e);
      console.error("Status:", e?.statusCode || e?.status);
      if (e?.body) console.error("Body:", e.body);
      throw e;
    }
  }

  console.log("DONE");
}

run().catch((e) => {
  console.error("Import failed:", e?.message || e);
  process.exit(1);
});
