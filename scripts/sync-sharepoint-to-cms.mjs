import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { ClientSecretCredential } from "@azure/identity";

dotenv.config({ path: ".env.imports" });

const {
  TENANT_ID,
  CLIENT_ID,
  CLIENT_SECRET,
  SHAREPOINT_SITE_ID,
  SP_LIST_CATEGORIES_ID,
  SP_LIST_PRODUCTS_ID,
} = process.env;

if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !SHAREPOINT_SITE_ID || !SP_LIST_CATEGORIES_ID || !SP_LIST_PRODUCTS_ID) {
  console.error("Missing env vars for sync.");
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
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

function toStr(v) {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s ? s : undefined;
}

function parseJson(v, fallback) {
  const s = toStr(v);
  if (!s) return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
}

function urlValue(v) {
  // URL field puede venir como { Url, Description } o string
  if (!v) return undefined;
  if (typeof v === "string") return toStr(v);
  return toStr(v.Url) || toStr(v.url);
}

function normalizeSlug(v) {
  let s = toStr(v) || "";
  if (!s) return undefined;
  s = s.replace(/^\/+/, "");                 // quita "/" inicial
  s = s.replace(/^categorias\//, "");        // por si viene "categorias/xxx"
  s = s.replace(/^\/?categorias\//, "");     // por si viene "/categorias/xxx"
  s = s.replace(/^\/?categorias\/+/i, "");   // robusto
  s = s.replace(/^\/?categorias\//i, "");
  s = s.replace(/^\/categorias\//i, "");
  s = s.replace(/^categorias\//i, "");
  s = s.replace(/^\/?categorias\//i, "");
  s = s.replace(/^\/?categorias\//i, "");
  // caso típico que has visto: "/categorias/gran-formato"
  s = s.replace(/^categorias\//i, "");
  s = s.replace(/^\/?categorias\//i, "");
  s = s.replace(/^\/?categorias\//i, "");
  s = s.replace(/^\/?categorias\//i, "");
  s = s.replace(/^\/?categorias\//i, "");
  // finalmente limpia slashes
  s = s.replace(/^\/+|\/+$/g, "");
  return s || undefined;
}

function normalizeParentSlug(parent, slug) {
  const p = normalizeSlug(parent);
  if (!p) return undefined;
  // evita padres “placeholder” o errores de datos
  if (p === "categorias") return undefined;
  if (slug && p === slug) return undefined;
  return p;
}

function normalizeCategoryPath(pathValue, slug, parent) {
  let p = toStr(pathValue) || "";
  if (p) {
    // asegurar formato "/categorias/..."
    p = p.replace(/\/{2,}/g, "/").trim();
    if (!p.startsWith("/")) p = "/" + p;
    if (!p.startsWith("/categorias/")) {
      // si viene solo "adhesivos" o "gran-formato"
      p = "/categorias/" + p.replace(/^\/+/, "");
    }
    return p.replace(/\/+$/, "");
  }

  // fallback si no hay Path en SP
  if (parent) return `/categorias/${parent}/${slug}`;
  return `/categorias/${slug}`;
}

function parseStringList(v) {
  // acepta JSON array string o "a,b,c"
  const s = toStr(v);
  if (!s) return [];
  const j = parseJson(s, null);
  if (Array.isArray(j)) return j.map(toStr).filter(Boolean);
  return s.split(",").map(x => String(x).trim()).filter(Boolean);
}

function uniq(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

async function fetchAllItems(listId, selectFields) {
  const hasSelect = Array.isArray(selectFields) && selectFields.length > 0;

  const expand = hasSelect
    ? `fields($select=${selectFields.join(",")})`
    : "fields";

  const base =
    `/sites/${SHAREPOINT_SITE_ID}/lists/${listId}/items` +
    `?$top=999&$expand=${expand}`;

  const items = [];
  let next = base;

  while (next) {
    const res = await withRetry(() =>
      graph.api(next).header("Prefer", "apiversion=2.1").get()
    );
    for (const it of res.value || []) items.push(it);
    next = res["@odata.nextLink"] || null;
  }
  return items;
}


function buildCategory(item) {
  const f = item.fields || {};

  const slug = normalizeSlug(f.CategorySlug);
  if (!slug) return null;

  const title = toStr(f.Title) || slug;

  const parent = normalizeParentSlug(f.ParentSlug, slug);
  const pathValue = normalizeCategoryPath(f.Path, slug, parent);

  const legacySlugs = uniq(parseStringList(f.LegacySlugs).map(normalizeSlug));
  const extraCategorySlugs = uniq(parseJson(f.ExtraCategorySlugsJson, []).map(normalizeSlug));
  const allSlugs = uniq([slug, ...legacySlugs, ...extraCategorySlugs]);

  const seo = {
    metaTitle: toStr(f.MetaTitle),
    metaDescription: toStr(f.MetaDescription) || toStr(f.Description),
    canonical: toStr(f.Canonical),
    hreflang: parseJson(f.HrefLangJson, []),
    keywords: parseJson(f.KeywordsJson, []),
    searchTerms: parseJson(f.SearchTermsJson, []),
    schema: parseJson(f.SchemaJson, {}),
    robotsOverride: toStr(f.RobotsOverride) || "INHERIT",
    robotsAdvanced: toStr(f.RobotsAdvanced),
    ogImageSrc: urlValue(f.OgImageSrc),
  };

  return {
    id: String(item.id),
    updatedAt: item?.lastModifiedDateTime || item?.lastModifiedDateTime?.toString?.() || undefined,

    type: parent ? "subcategoria" : "categoria",
    slug,
    slugs: allSlugs,                // ✅ útil para matching + redirects
    legacySlugs,
    extraCategorySlugs,

    title,
    nav: toStr(f.NavLabel) || title,
    order: Number(f.SortOrder ?? 0) || 0,
    parent: parent || undefined,

    hidden: Boolean(f.IsHidden),
    featured: Boolean(f.IsFeatured),
    isPublished: Boolean(f.IsPublished),
    publishedAt: toStr(f.PublishedAt),

    description: toStr(f.Description),
    bodyMd: toStr(f.BodyMd),

    image: {
      src: urlValue(f.ImageSrc),
      width: f.ImageWidth ? Number(f.ImageWidth) : undefined,
      height: f.ImageHeight ? Number(f.ImageHeight) : undefined,
      alt: toStr(f.ImageAlt) || title,
    },

    galleryImages: parseJson(f.GalleryImagesJson, []),
    breadcrumbs: parseJson(f.BreadcrumbsJson, []),

    cta: {
      text: toStr(f.CtaText),
      link: urlValue(f.CtaLink),
    },

    faqs: parseJson(f.FaqsJson, []),

    // ✅ raw JSON blocks (lo parsearemos/normalizaremos en el endpoint)
    TabsJson: toStr(f.TabsJson),

    // ✅ usa Path real si existe (mejor para subcategorías y SEO)
    path: pathValue,

    seo,
  };
}

function buildProduct(item) {
  const f = item.fields || {};
  const slug = toStr(f.ProductSlug);
  if (!slug) return null;

  const title = toStr(f.Title) || slug;

  const seo = {
    metaTitle: toStr(f.MetaTitle),
    metaDescription: toStr(f.MetaDescription) || toStr(f.ShortDescription),
    canonical: toStr(f.Canonical),
    hreflang: parseJson(f.HrefLangJson, []),
    keywords: parseJson(f.KeywordsJson, []),
    searchTerms: parseJson(f.SearchTermsJson, []),
    schema: parseJson(f.SchemaJson, {}),
  };

  return {
    id: String(item.id),
    type: "producto",
    slug,
    title,

    categorySlug: toStr(f.CategorySlug) || "",

    isPublished: Boolean(f.IsPublished),
    publishedAt: toStr(f.PublishedAt),

    shortDescription: toStr(f.ShortDescription),
    bodyMd: toStr(f.BodyMd),

    image: {
      src: urlValue(f.ImageSrc),
      width: f.ImageWidth ? Number(f.ImageWidth) : undefined,
      height: f.ImageHeight ? Number(f.ImageHeight) : undefined,
      alt: toStr(f.ImageAlt) || title,
    },

    galleryImages: parseJson(f.GalleryImagesJson, []),

    sku: toStr(f.Sku),
    mpn: toStr(f.Mpn),
    gtin13: toStr(f.Gtin13),
    brand: toStr(f.Brand),
    price: f.Price != null && f.Price !== "" ? Number(f.Price) : undefined,
    priceCurrency: toStr(f.PriceCurrency),
    inStock: f.InStock === true ? true : f.InStock === false ? false : undefined,

    ratingValue: f.RatingValue != null && f.RatingValue !== "" ? Number(f.RatingValue) : undefined,
    reviewCount: f.ReviewCount != null && f.ReviewCount !== "" ? Number(f.ReviewCount) : undefined,

    attributes: parseJson(f.AttributesJson, []),
    variants: parseJson(f.VariantsJson, []),
    formFields: parseJson(f.FormFieldsJson, []),

    // Patrón que has elegido:
    path: `/productos/${slug}`,

    seo,
  };
}

async function run() {
  const categoryFields = [
  "Title","CategorySlug","NavLabel","SortOrder","ParentSlug",
  "IsFeatured","IsHidden","IsPublished","PublishedAt",
  "Description","BodyMd",
  "ImageSrc","ImageWidth","ImageHeight","ImageAlt",
  "GalleryImagesJson","BreadcrumbsJson",
  "CtaText","CtaLink",
+ "Path",
+ "TabsJson",
+ "OgImageSrc",
+ "LegacySlugs",
+ "ExtraCategorySlugsJson",
+ "RobotsOverride",
+ "RobotsAdvanced",
  "MetaTitle","MetaDescription","Canonical",
  "HrefLangJson","KeywordsJson","SearchTermsJson",
  "FaqsJson","SchemaJson"
];


  const productFields = [
    "Title","ProductSlug","CategorySlug",
    "IsPublished","PublishedAt",
    "ShortDescription","BodyMd",
    "ImageSrc","ImageWidth","ImageHeight","ImageAlt",
    "GalleryImagesJson",
    "Sku","Mpn","Gtin13","Brand","Price","PriceCurrency","InStock",
    "RatingValue","ReviewCount",
    "AttributesJson","VariantsJson","FormFieldsJson",
    "MetaTitle","MetaDescription","Canonical",
    "HrefLangJson","KeywordsJson","SearchTermsJson",
    "SchemaJson"
  ];

  const [catItems, prodItems] = await Promise.all([
    fetchAllItems(SP_LIST_CATEGORIES_ID, []),
    fetchAllItems(SP_LIST_PRODUCTS_ID, []),
  ]);

  const categories = catItems.map(buildCategory).filter(Boolean).filter(c => c.isPublished);
  const products = prodItems.map(buildProduct).filter(Boolean).filter(p => p.isPublished);

  // Validación de slugs únicos (crítico con /categorias/:slug)
  const dupCat = findDuplicates(categories.map(c => c.slug));
  const dupProd = findDuplicates(products.map(p => p.slug));
  if (dupCat.length || dupProd.length) {
    const report = { dupCat, dupProd };
    await fs.mkdir("cms", { recursive: true });
    await fs.writeFile("cms/slug-collisions.json", JSON.stringify(report, null, 2), "utf8");
    throw new Error(`Slug collisions detected. See cms/slug-collisions.json`);
  }

  const routes = [
    ...categories.map(c => c.path),
    ...products.map(p => p.path),
  ].sort();

  await fs.mkdir("cms", { recursive: true });
  await fs.writeFile("cms/catalog.json", JSON.stringify({
    generatedAt: new Date().toISOString(),
    categories,
    products,
  }, null, 2), "utf8");

  await fs.writeFile("cms/routes.json", JSON.stringify(routes, null, 2), "utf8");

  console.log(`CMS sync OK. categories=${categories.length} products=${products.length} routes=${routes.length}`);
}

function findDuplicates(arr) {
  const seen = new Set();
  const dup = new Set();
  for (const x of arr) {
    if (seen.has(x)) dup.add(x);
    else seen.add(x);
  }
  return [...dup];
}

run().catch((e) => {
  console.error("Sync failed:", e?.message || e);
  process.exit(1);
});
