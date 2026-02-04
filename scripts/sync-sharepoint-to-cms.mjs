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

function parseJson(v, fallback) {
  const s = toStr(v);
  if (!s) return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
}

// 🔥 CORRECCIÓN CRÍTICA: Limpieza de URLs que vienen con descripción
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

function normalizeSlug(v) {
  let s = toStr(v) || "";
  if (!s) return undefined;
  // Limpieza agresiva pero segura
  s = s.replace(/^\/+|\/+$/g, ""); // Trim slashes
  s = s.replace(/^categorias\//i, ""); // Quitar prefijos comunes duplicados
  return s || undefined;
}

function normalizeParentSlug(parent, slug) {
  const p = normalizeSlug(parent);
  if (!p) return undefined;
  if (p === "categorias") return undefined;
  if (slug && p === slug) return undefined;
  return p;
}

function normalizeCategoryPath(pathValue, slug, parent) {
  let p = toStr(pathValue) || "";
  if (p) {
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
  // NOTA: Para columnas calculadas o complejas, a veces es mejor no filtrar con $select
  // Si algo te falla al traer datos, prueba quitando el select temporalmente.
  const hasSelect = Array.isArray(selectFields) && selectFields.length > 0;
  const expand = hasSelect ? `fields($select=${selectFields.join(",")})` : "fields";
  const base = `/sites/${SHAREPOINT_SITE_ID}/lists/${listId}/items?$top=999&$expand=${expand}`;

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

// --- MAPPERS ---

function buildCategory(item) {
  const f = item.fields || {};
  const slug = normalizeSlug(f.CategorySlug);
  if (!slug) return null;

  const title = toStr(f.Title) || slug;
  const parent = normalizeParentSlug(f.ParentSlug, slug);
  const pathValue = normalizeCategoryPath(f.Path, slug, parent);
  const baseUrl = "https://reprodisseny.com"; 
  const canonicalUrl = `${baseUrl}${pathValue}`;

  const imageSrc = urlValue(f.ImageSrc);

  // SEO y Schema
  const manualSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": toStr(f.Description),
    "url": canonicalUrl,
    "image": imageSrc,
    "publisher": {
        "@type": "Organization",
        "name": "Repro Disseny"
    }
  };
  const spSchema = parseJson(f.SchemaJson, {});
  
  // Parsear Tabs
  const tabs = parseJson(f.TabsJson, []);

  return {
    id: String(item.id),
    updatedAt: item?.lastModifiedDateTime,
    type: parent ? "subcategoria" : "categoria",
    
    slug,
    path: pathValue, // Ruta limpia y definitiva
    
    title,
    nav: toStr(f.NavLabel) || title,
    order: Number(f.SortOrder ?? 0) || 0,
    parent,
    
    hidden: Boolean(f.IsHidden),
    featured: Boolean(f.IsFeatured),
    isPublished: Boolean(f.IsPublished),
    publishedAt: toStr(f.PublishedAt),

    description: toStr(f.Description),
    bodyMd: toStr(f.BodyMd),

    // 🔥 Fix: Parsear Tabs a Array
    tabs: tabs,
    
    image: {
      src: imageSrc,
      width: f.ImageWidth ? Number(f.ImageWidth) : undefined,
      height: f.ImageHeight ? Number(f.ImageHeight) : undefined,
      alt: toStr(f.ImageAlt) || title,
    },

    cta: {
      text: toStr(f.CtaText),
      link: urlValue(f.CtaLink), // 🔥 Fix: Link limpio
    },

    faqs: parseJson(f.FaqsJson, []),
    galleryImages: parseJson(f.GalleryImagesJson, []),
    breadcrumbs: parseJson(f.BreadcrumbsJson, []),
    legacySlugs: uniq(parseStringList(f.LegacySlugs).map(normalizeSlug)),

    seo: {
      metaTitle: toStr(f.MetaTitle) || title,
      metaDescription: toStr(f.MetaDescription) || toStr(f.Description),
      canonical: canonicalUrl, // Coincide con path
      hreflang: parseJson(f.HrefLangJson, [{ lang: "es-ES", url: canonicalUrl }]),
      keywords: parseJson(f.KeywordsJson, []),
      schema: { ...manualSchema, ...spSchema }, // Fusionar schema base con overrides de SP
      robotsOverride: toStr(f.RobotsOverride) || "INHERIT",
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
  const inStock = f.InStock === true;

  // Construcción base del Schema para evitar datos rotos
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": title,
    "description": toStr(f.ShortDescription) || toStr(f.MetaDescription),
    "image": imageSrc,
    "url": canonicalUrl,
    "sku": toStr(f.Sku),
    "brand": { "@type": "Organization", "name": toStr(f.Brand) || "Reprodisseny" },
  };

  // Solo añadimos offers si el precio tiene sentido (mayor a 0)
  if (price > 0) {
    baseSchema.offers = {
      "@type": "Offer",
      "price": price,
      "priceCurrency": toStr(f.PriceCurrency) || "EUR",
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": canonicalUrl
    };
  }

  const spSchema = parseJson(f.SchemaJson, {});

  return {
    id: String(item.id),
    type: "producto",
    slug,
    path: pathValue, // Ruta definitiva

    title,
    categorySlug: toStr(f.CategorySlug) || "",
    isPublished: Boolean(f.IsPublished),
    publishedAt: toStr(f.PublishedAt),

    shortDescription: toStr(f.ShortDescription),
    bodyMd: toStr(f.BodyMd),

    image: {
      src: imageSrc, // 🔥 Fix: URL limpia
      width: f.ImageWidth ? Number(f.ImageWidth) : undefined,
      height: f.ImageHeight ? Number(f.ImageHeight) : undefined,
      alt: toStr(f.ImageAlt) || title,
    },

    galleryImages: parseJson(f.GalleryImagesJson, []),

    sku: toStr(f.Sku),
    brand: toStr(f.Brand),
    price: price, // Normalizado
    priceCurrency: toStr(f.PriceCurrency) || "EUR",
    inStock: inStock,

    attributes: parseJson(f.AttributesJson, []),
    variants: parseJson(f.VariantsJson, []),
    formFields: parseJson(f.FormFieldsJson, []),

    seo: {
      metaTitle: toStr(f.MetaTitle) || title,
      metaDescription: toStr(f.MetaDescription) || toStr(f.ShortDescription),
      canonical: canonicalUrl, // Coincide con path
      hreflang: parseJson(f.HrefLangJson, [{ lang: "es-ES", url: canonicalUrl }]),
      keywords: parseJson(f.KeywordsJson, []),
      schema: { ...baseSchema, ...spSchema }, // Fusionar base robusta con SP
    },
  };
}

// --- MAIN RUN ---

async function run() {
  console.log("Starting Sync...");
  
  // Definimos fields para no traer basura extra, pero asegúrate 
  // que los nombres coinciden EXACTAMENTE con los "Internal Names" de SP.
  const categoryFields = [
    "Title","CategorySlug","NavLabel","SortOrder","ParentSlug",
    "IsFeatured","IsHidden","IsPublished","PublishedAt",
    "Description","BodyMd",
    "ImageSrc","ImageWidth","ImageHeight","ImageAlt",
    "GalleryImagesJson","BreadcrumbsJson",
    "CtaText","CtaLink",
    "Path","TabsJson","LegacySlugs", // TabsJson se parseará
    "MetaTitle","MetaDescription","Canonical",
    "HrefLangJson","KeywordsJson","SchemaJson", "FaqsJson"
  ];

  const productFields = [
    "Title","ProductSlug","CategorySlug",
    "IsPublished","PublishedAt",
    "ShortDescription","BodyMd",
    "ImageSrc","ImageWidth","ImageHeight","ImageAlt",
    "GalleryImagesJson",
    "Sku","Brand","Price","PriceCurrency","InStock",
    "AttributesJson","VariantsJson","FormFieldsJson",
    "MetaTitle","MetaDescription","Canonical",
    "HrefLangJson","KeywordsJson","SchemaJson"
  ];

  const [catItems, prodItems] = await Promise.all([
    fetchAllItems(SP_LIST_CATEGORIES_ID, categoryFields),
    fetchAllItems(SP_LIST_PRODUCTS_ID, productFields),
  ]);

  const categories = catItems.map(buildCategory).filter(Boolean).filter(c => c.isPublished);
  const products = prodItems.map(buildProduct).filter(Boolean).filter(p => p.isPublished);

  // Validación de colisiones
  const dupCat = findDuplicates(categories.map(c => c.slug));
  const dupProd = findDuplicates(products.map(p => p.slug));
  
  if (dupCat.length || dupProd.length) {
    const report = { dupCat, dupProd };
    await fs.mkdir("cms", { recursive: true });
    await fs.writeFile("cms/slug-collisions.json", JSON.stringify(report, null, 2), "utf8");
    console.error("⛔ Slug collisions detected:", report);
    // process.exit(1); // Opcional: fallar el build si hay duplicados
  }

  // Generar lista plana de rutas para sitemaps / prerender
  const routes = [
    ...categories.map(c => c.path),
    ...products.map(p => p.path),
  ].sort();

  await fs.mkdir("cms", { recursive: true });
  
  // Guardamos el catálogo limpio
  await fs.writeFile("cms/catalog.json", JSON.stringify({
    generatedAt: new Date().toISOString(),
    categories,
    products,
  }, null, 2), "utf8");

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