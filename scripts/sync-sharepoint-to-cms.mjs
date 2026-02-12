import fs from "node:fs/promises";
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

if (
  !TENANT_ID ||
  !CLIENT_ID ||
  !CLIENT_SECRET ||
  !SHAREPOINT_SITE_ID ||
  !SP_LIST_CATEGORIES_ID ||
  !SP_LIST_PRODUCTS_ID
) {
  console.error("Missing env vars for sync.");
  process.exit(1);
}

// --- CONFIG CLIENTE ---
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

// --- HELPER FUNCTIONS ---

function toStr(v) {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s ? s : undefined;
}

function toBool(v) {
  if (v == null) return false;
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  if (!s) return false;
  if (["1", "true", "yes", "y", "si", "sí", "verdadero"].includes(s)) return true;
  if (["0", "false", "no", "n", "falso"].includes(s)) return false;
  return Boolean(v);
}

function parseJson(v, fallback) {
  if (v == null) return fallback;
  if (typeof v === "object") return v; // por si Graph ya devuelve objeto
  const s = toStr(v);
  if (!s) return fallback;
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

// 🔥 Limpieza de URLs que vienen con descripción o formato LinkField
function urlValue(v) {
  // SharePoint a veces devuelve: "https://url.com, Descripción"
  let rawUrl = "";

  if (!v) return undefined;
  if (typeof v === "string") {
    rawUrl = v;
  } else {
    rawUrl = v.Url || v.url || "";
  }

  // Quedarse solo con la parte antes de la coma
  const clean = rawUrl.split(",")[0].trim();
  return clean || undefined;
}

function urlPathValue(v) {
  const s = toStr(v);
  if (!s) return undefined;
  if (s.startsWith("/")) return s;
  try {
    return new URL(s).pathname || undefined;
  } catch {
    return undefined;
  }
}

function normalizeSlug(v) {
  let s = toStr(v) || "";
  if (!s) return undefined;

  // Si viene como URL completa, usa pathname
  if (s.includes("://")) {
    try {
      s = new URL(s).pathname || s;
    } catch {}
  }

  // Quitar query/hash
  s = s.split("?")[0].split("#")[0];

  // Trim slashes
  s = s.replace(/^\/+|\/+$/g, "");

  // Quitar prefijos comunes
  s = s.replace(/^\/?categorias\//i, "");
  s = s.replace(/^categorias\//i, "");

  return s || undefined;
}

function slugLeaf(v) {
  const s = normalizeSlug(v);
  if (!s) return undefined;
  const parts = s.split("/").filter(Boolean);
  return parts[parts.length - 1] || undefined;
}

function normalizeParentSlug(parent, slug) {
  const p = slugLeaf(parent);
  if (!p) return undefined;
  if (p === "categorias") return undefined;
  if (slug && p === slug) return undefined;
  return p;
}

// Si no viene ParentCategory/ParentSlug, intenta inferirlo desde Path/Canonical (cuando exista)
function inferParentFromPath(pathValue, slug) {
  const p = urlPathValue(pathValue) || toStr(pathValue);
  if (!p || !slug) return undefined;
  // esperamos algo tipo /categorias/<parent>/<slug>  o /categorias/<slug>
  const clean = p.split("?")[0].split("#")[0].replace(/\/{2,}/g, "/");
  const segs = clean.split("/").filter(Boolean);
  const idx = segs.findIndex((x) => x.toLowerCase() === "categorias");
  if (idx < 0) return undefined;
  const after = segs.slice(idx + 1); // lo que hay tras "categorias"
  if (after.length < 2) return undefined;
  const last = after[after.length - 1];
  if (normalizeSlug(last) !== normalizeSlug(slug)) return undefined;
  return after[after.length - 2];
}

function normalizeCategoryPath(pathValue, slug, parent) {
  let p = toStr(pathValue) || "";
  if (p) {
    // Si viene como URL completa, convertir a pathname
    if (p.includes("://")) {
      try {
        p = new URL(p).pathname || p;
      } catch {}
    }
    p = p.replace(/\/{2,}/g, "/").trim(); // Dobles slashes
    if (!p.startsWith("/")) p = "/" + p;
    // Asegurar prefijo base
    if (!p.startsWith("/categorias/")) {
      p = "/categorias/" + p.replace(/^\/+/, "");
    }
    return p.replace(/\/+$/, "");
  }
  // Fallback lógico
  if (parent) return `/categorias/${parent}/${slug}`;
  return `/categorias/${slug}`;
}

function parseStringList(v) {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(toStr).filter(Boolean);
  const s = toStr(v);
  if (!s) return [];
  const j = parseJson(s, null);
  if (Array.isArray(j)) return j.map(toStr).filter(Boolean);
  return s
    .split(",")
    .map((x) => String(x).trim())
    .filter(Boolean);
}

function uniq(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

async function fetchAllItems(listId, selectFields) {
  const hasSelect = Array.isArray(selectFields) && selectFields.length > 0;
  const expand = hasSelect ? `fields($select=${selectFields.join(",")})` : "fields";
  const base = `/sites/${SHAREPOINT_SITE_ID}/lists/${listId}/items?$top=999&$expand=${expand}`;

  const items = [];
  let next = base;

  while (next) {
    const res = await withRetry(() => graph.api(next).header("Prefer", "apiversion=2.1").get());
    for (const it of res.value || []) items.push(it);
    next = res["@odata.nextLink"] || null;
  }
  return items;
}

// --- MAPPERS ---

function buildCategory(item) {
  const f = item.fields || {};

  // 1) slug: CategorySlug -> Path -> Canonical -> SchemaJson.url
  const pathHint = urlPathValue(f.Path) || urlPathValue(f.Canonical);
  let slug = slugLeaf(f.CategorySlug) || slugLeaf(pathHint) || slugLeaf(f.Canonical);

  if (!slug) {
    const sj = parseJson(f.SchemaJson, null);
    slug = slugLeaf(sj?.url);
  }
  if (!slug) return null;

  const title = toStr(f.Title) || slug;

  // 2) parent: ParentCategory (CSV/SP) + fallback a ParentSlug (compat)
  const parentRaw = f.ParentCategory ?? f.ParentSlug;
  let parent = normalizeParentSlug(parentRaw, slug);

  // 3) inferencia desde path/canonical si no vino parent
  if (!parent) {
    const inferred = inferParentFromPath(pathHint || f.Canonical, slug);
    parent = normalizeParentSlug(inferred, slug);
  }

  // 4) path: usa Path si viene, si no Canonical, si no fallback
  const pathValue = normalizeCategoryPath(pathHint, slug, parent);

  const baseUrl = "https://reprodisseny.com";
  const canonicalUrl = `${baseUrl}${pathValue}`;

  const imageSrc = urlValue(f.ImageSrc) || urlValue(f.OgImageSrc);

  // SEO y Schema
  const manualSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: toStr(f.Description),
    url: canonicalUrl,
    image: imageSrc,
    publisher: {
      "@type": "Organization",
      name: "Repro Disseny",
    },
  };

  const spSchema = parseJson(f.SchemaJson, {});
  const tabs = parseJson(f.TabsJson, []);

  return {
    id: String(item.id),
    updatedAt: item?.lastModifiedDateTime,
    type: parent ? "subcategoria" : "categoria",

    slug,
    path: pathValue,

    title,
    nav: toStr(f.NavLabel) || title,
    order: Number(f.SortOrder ?? 0) || 0,
    parent,

    hidden: toBool(f.IsHidden),
    featured: toBool(f.IsFeatured),
    isPublished: toBool(f.IsPublished),
    publishedAt: toStr(f.PublishedAt),

    description: toStr(f.Description),
    bodyMd: toStr(f.BodyMd),

    tabs,

    image: {
      src: imageSrc,
      width: f.ImageWidth ? Number(f.ImageWidth) : undefined,
      height: f.ImageHeight ? Number(f.ImageHeight) : undefined,
      alt: toStr(f.ImageAlt) || title,
    },

    cta: {
      text: toStr(f.CtaText),
      link: urlValue(f.CtaLink),
    },

    faqs: parseJson(f.FaqsJson, []),
    galleryImages: parseJson(f.GalleryImagesJson, []),
    breadcrumbs: parseJson(f.BreadcrumbsJson, []),

    // compat: algunos exports lo llaman LegacySlugsJson
    legacySlugs: uniq(parseStringList(f.LegacySlugs ?? f.LegacySlugsJson).map(normalizeSlug)),

    seo: {
      metaTitle: toStr(f.MetaTitle) || title,
      metaDescription: toStr(f.MetaDescription) || toStr(f.Description),
      canonical: canonicalUrl,
      hreflang: parseJson(f.HrefLangJson, [{ lang: "es-ES", url: canonicalUrl }]),
      keywords: parseJson(f.KeywordsJson, []),
      schema: { ...manualSchema, ...spSchema },
      robotsOverride: toStr(f.RobotsOverride) || "INHERIT",
      robotsAdvanced: toStr(f.RobotsAdvanced),
    },
  };
}

function buildProduct(item) {
  const f = item.fields || {};
  const slug = toStr(f.ProductSlug);
  if (!slug) return null;

  const title = toStr(f.Title) || slug;
  const pathValue = `/productos/${slug}`;
  const baseUrl = "https://reprodisseny.com";
  const canonicalUrl = `${baseUrl}${pathValue}`;

  const imageSrc = urlValue(f.ImageSrc);
  const price = f.Price != null && f.Price !== "" ? Number(f.Price) : 0;
  const inStock = toBool(f.InStock);

  // Schema base robusto
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: toStr(f.ShortDescription) || toStr(f.MetaDescription),
    image: imageSrc,
    url: canonicalUrl,
    sku: toStr(f.Sku),
    brand: { "@type": "Organization", name: toStr(f.Brand) || "Reprodisseny" },
  };

  if (price > 0) {
    baseSchema.offers = {
      "@type": "Offer",
      price: price,
      priceCurrency: toStr(f.PriceCurrency) || "EUR",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: canonicalUrl,
    };
  }

  const spSchema = parseJson(f.SchemaJson, {});

  return {
    id: String(item.id),
    type: "producto",
    slug,
    path: pathValue,

    title,

    // Normaliza CategorySlug por si viene como /categorias/... o con path
    categorySlug: slugLeaf(f.CategorySlug) || normalizeSlug(f.CategorySlug) || "",

    isPublished: toBool(f.IsPublished),
    publishedAt: toStr(f.PublishedAt),

    shortDescription: toStr(f.ShortDescription),
    bodyMd: toStr(f.BodyMd),

    image: {
      src: imageSrc,
      width: f.ImageWidth ? Number(f.ImageWidth) : undefined,
      height: f.ImageHeight ? Number(f.ImageHeight) : undefined,
      alt: toStr(f.ImageAlt) || title,
    },

    galleryImages: parseJson(f.GalleryImagesJson, []),

    sku: toStr(f.Sku),
    brand: toStr(f.Brand),
    price,
    priceCurrency: toStr(f.PriceCurrency) || "EUR",
    inStock,

    attributes: parseJson(f.AttributesJson, []),
    variants: parseJson(f.VariantsJson, []),
    formFields: parseJson(f.FormFieldsJson, []),

    seo: {
      metaTitle: toStr(f.MetaTitle) || title,
      metaDescription: toStr(f.MetaDescription) || toStr(f.ShortDescription),
      canonical: canonicalUrl,
      hreflang: parseJson(f.HrefLangJson, [{ lang: "es-ES", url: canonicalUrl }]),
      keywords: parseJson(f.KeywordsJson, []),
      schema: { ...baseSchema, ...spSchema },
    },
  };
}

// --- MAIN RUN ---

async function run() {
  console.log("Starting Sync...");

  // OJO: estos nombres deben coincidir con los Internal Names en SP
  const categoryFields = [
    "Title",
    "CategorySlug",
    "NavLabel",
    "SortOrder",
    "ParentCategory", // <- CLAVE para jerarquía (menu)
    // (fallback legacy si existiera en tu lista)
    // "ParentSlug",
    "IsFeatured",
    "IsHidden",
    "IsPublished",
    "PublishedAt",
    "Description",
    "BodyMd",
    "ImageSrc",
    "ImageWidth",
    "ImageHeight",
    "ImageAlt",
    "GalleryImagesJson",
    "BreadcrumbsJson",
    "CtaText",
    "CtaLink",
    "Path",
    "TabsJson",
    "LegacySlugs",
    "MetaTitle",
    "MetaDescription",
    "Canonical",
    "HrefLangJson",
    "KeywordsJson",
    "SchemaJson",
    "FaqsJson",
    "RobotsOverride",
    "RobotsAdvanced",
    "OgImageSrc",
  ];

  const productFields = [
    "Title",
    "ProductSlug",
    "CategorySlug",
    "IsPublished",
    "PublishedAt",
    "ShortDescription",
    "BodyMd",
    "ImageSrc",
    "ImageWidth",
    "ImageHeight",
    "ImageAlt",
    "GalleryImagesJson",
    "Sku",
    "Brand",
    "Price",
    "PriceCurrency",
    "InStock",
    "AttributesJson",
    "VariantsJson",
    "FormFieldsJson",
    "MetaTitle",
    "MetaDescription",
    "Canonical",
    "HrefLangJson",
    "KeywordsJson",
    "SchemaJson",
  ];

  const [catItems, prodItems] = await Promise.all([
    fetchAllItems(SP_LIST_CATEGORIES_ID, categoryFields),
    fetchAllItems(SP_LIST_PRODUCTS_ID, productFields),
  ]);

  const categoriesAll = catItems.map(buildCategory).filter(Boolean);
  const categories = categoriesAll.filter((c) => c.isPublished);

  const productsAll = prodItems.map(buildProduct).filter(Boolean);
  const products = productsAll.filter((p) => p.isPublished);

  // --- Validaciones útiles para el menú ---
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const orphans = categories.filter((c) => c.parent && !bySlug.has(c.parent));

  await fs.mkdir("cms", { recursive: true });

  if (orphans.length) {
    await fs.writeFile(
      "cms/orphan-categories.json",
      JSON.stringify(orphans.map((o) => ({ slug: o.slug, parent: o.parent, title: o.title })), null, 2),
      "utf8"
    );
    console.warn("⚠️ Orphan categories (parent not found):", orphans.map((o) => `${o.slug} -> ${o.parent}`));
  }

  // --- Validación de colisiones ---
  const dupCat = findDuplicates(categories.map((c) => c.slug));
  const dupProd = findDuplicates(products.map((p) => p.slug));

  if (dupCat.length || dupProd.length) {
    const report = { dupCat, dupProd };
    await fs.writeFile("cms/slug-collisions.json", JSON.stringify(report, null, 2), "utf8");
    console.error("⛔ Slug collisions detected:", report);
    // process.exit(1); // Opcional: fallar el build si hay duplicados
  }

  // Rutas para sitemaps / prerender
  const routes = [...categories.map((c) => c.path), ...products.map((p) => p.path)].sort();

  // Guardar catálogo
  await fs.writeFile(
    "cms/catalog.json",
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        categories,
        products,
      },
      null,
      2
    ),
    "utf8"
  );

  await fs.writeFile("cms/routes.json", JSON.stringify(routes, null, 2), "utf8");

  console.log(`✅ CMS sync OK.`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Products:   ${products.length}`);
  console.log(`   Routes:     ${routes.length}`);
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
