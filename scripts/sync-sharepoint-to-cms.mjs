/* sync-cms.mjs (definitivo)
   - Lee categorías y productos desde SharePoint (Graph)
   - Genera cms/catalog.json + cms/routes.json
   - Tabs:
     1) Si TabsJson existe y tiene tabs válidas => se usa
     2) Si NO, se generan desde BodyMd:
        - Texto antes del primer "##" => tab "Descripción" (si hay contenido)
        - Cada "## Título" => 1 TAB (Formatos / Ubicación / Contenido / etc.)
        - Dentro de cada tab, soporta ### / #### como subtítulos y bullets
*/

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

// --- HELPERS BÁSICOS ---
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
  if (typeof v === "object") return v; // Graph a veces ya devuelve objeto
  const s = toStr(v);
  if (!s) return fallback;
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

// --- URLs / SLUGS ---
function urlValue(v) {
  // SharePoint a veces devuelve: "https://url.com, Descripción"
  let rawUrl = "";
  if (!v) return undefined;

  if (typeof v === "string") rawUrl = v;
  else rawUrl = v.Url || v.url || "";

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

  if (s.includes("://")) {
    try {
      s = new URL(s).pathname || s;
    } catch {}
  }

  s = s.split("?")[0].split("#")[0];
  s = s.replace(/^\/+|\/+$/g, "");
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

function inferParentFromPath(pathValue, slug) {
  const p = urlPathValue(pathValue) || toStr(pathValue);
  if (!p || !slug) return undefined;

  const clean = p.split("?")[0].split("#")[0].replace(/\/{2,}/g, "/");
  const segs = clean.split("/").filter(Boolean);
  const idx = segs.findIndex((x) => x.toLowerCase() === "categorias");
  if (idx < 0) return undefined;

  const after = segs.slice(idx + 1);
  if (after.length < 2) return undefined;

  const last = after[after.length - 1];
  if (normalizeSlug(last) !== normalizeSlug(slug)) return undefined;

  return after[after.length - 2];
}

function normalizeCategoryPath(pathValue, slug, parent) {
  let p = toStr(pathValue) || "";
  if (p) {
    if (p.includes("://")) {
      try {
        p = new URL(p).pathname || p;
      } catch {}
    }
    p = p.replace(/\/{2,}/g, "/").trim();
    if (!p.startsWith("/")) p = "/" + p;
    if (!p.startsWith("/categorias/")) p = "/categorias/" + p.replace(/^\/+/, "");
    return p.replace(/\/+$/, "");
  }
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

// --- FETCH ALL ITEMS (Graph paging) ---
async function fetchAllItems(listId, selectFields) {
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

// --- HTML / MARKDOWN -> BLOCKS (para CategoryTabs) ---
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (ch) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[ch] || ch;
  });
}

function normalizeMdText(v) {
  return String(v ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ")
    .trim();
}

function stripMdInline(s) {
  return String(s ?? "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

function slugifyId(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Markdown simple -> blocks
 * - párrafos -> { type:"text" }
 * - bullets -> { type:"bullets" }
 * - ### / #### -> { type:"text", html:true, text:"<h3>..." }
 * - imágenes ![alt](url "caption") -> { type:"image" }
 */
function mdChunkToBlocks(md) {
  const text = normalizeMdText(md);
  if (!text) return [];

  const lines = text.split("\n");
  const blocks = [];

  let paragraph = [];
  let bullets = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const t = paragraph.join("\n").trim();
    if (t) blocks.push({ type: "text", text: t, html: false });
    paragraph = [];
  };

  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push({
      type: "bullets",
      items: bullets.map((x) => String(x).trim()).filter(Boolean),
    });
    bullets = [];
  };

  const pushHeading = (level, title) => {
    const safe = escapeHtml(stripMdInline(title));
    const tag = level === 4 ? "h4" : "h3";
    blocks.push({
      type: "text",
      html: true,
      format: "html",
      text: `<${tag}>${safe}</${tag}>`,
    });
  };

  for (const rawLine of lines) {
    const line = String(rawLine ?? "");
    const t = line.trim();

    if (!t) {
      flushParagraph();
      flushBullets();
      continue;
    }

    const mH3 = t.match(/^###\s*(.+?)\s*$/);
    if (mH3) {
      flushParagraph();
      flushBullets();
      pushHeading(3, mH3[1]);
      continue;
    }
    const mH4 = t.match(/^####\s*(.+?)\s*$/);
    if (mH4) {
      flushParagraph();
      flushBullets();
      pushHeading(4, mH4[1]);
      continue;
    }

    const mImg = t.match(/^!\[(.*?)\]\((\S+?)(?:\s+"(.*?)")?\)$/);
    if (mImg) {
      flushParagraph();
      flushBullets();
      blocks.push({
        type: "image",
        src: mImg[2],
        alt: mImg[1] || "",
        caption: mImg[3] || undefined,
      });
      continue;
    }

    const mBullet = t.match(/^(?:[-*•·]\s*|\d+[.)]\s+)(.+)$/);
    if (mBullet) {
      flushParagraph();
      bullets.push(mBullet[1].trim());
      continue;
    }

    flushBullets();
    paragraph.push(t);
  }

  flushParagraph();
  flushBullets();

  return blocks;
}

/**
 * Separa BodyMd en:
 * - intro (antes del primer ##)
 * - sections (cada ##Titulo + contenido)
 */
function splitBodyMdSections(bodyMd) {
  const md = normalizeMdText(bodyMd);
  if (!md) return { introMd: "", sections: [] };

  const lines = md.split("\n");
  const introLines = [];
  const sections = [];
  let current = null;

  for (const rawLine of lines) {
    const line = String(rawLine ?? "");
    const t = line.trim();

    // H2: "## Título" o "##Título"
    const mH2 = t.match(/^##\s*(.+?)\s*$/);
    if (mH2) {
      const title = stripMdInline(mH2[1]);
      current = { title, lines: [] };
      sections.push(current);
      continue;
    }

    if (current) current.lines.push(line);
    else introLines.push(line);
  }

  return {
    introMd: introLines.join("\n").trim(),
    sections: sections.map((s) => ({
      title: s.title,
      md: (s.lines || []).join("\n").trim(),
    })),
  };
}

/**
 * Genera tabs desde BodyMd:
 * - Intro (antes del primer ##) => tab "Descripción" (si hay)
 * - Cada ## => 1 TAB (esto es lo que necesitas para Formatos/Ubicación/Contenido)
 */
function buildTabsFromBodyMd(bodyMd) {
  const md = normalizeMdText(bodyMd);
  if (!md) return [];

  const { introMd, sections } = splitBodyMdSections(md);

  const tabs = [];
  const usedIds = new Set();

  const pushTab = (title, blocks, preferredId) => {
    const base = slugifyId(preferredId || title) || "tab";
    let id = base;
    let n = 2;
    while (usedIds.has(id)) id = `${base}-${n++}`;
    usedIds.add(id);

    if (blocks && blocks.length) tabs.push({ id, title: String(title).trim(), blocks });
  };

  const introBlocks = mdChunkToBlocks(introMd);
  if (introBlocks.length) pushTab("Descripción", introBlocks, "descripcion");

  for (const sec of sections) {
    const title = String(sec.title || "").trim();
    const blocks = mdChunkToBlocks(sec.md);
    if (!title || !blocks.length) continue;
    pushTab(title, blocks);
  }

  if (!tabs.length) {
    const allBlocks = mdChunkToBlocks(md);
    if (allBlocks.length) pushTab("Descripción", allBlocks, "descripcion");
  }

  return tabs;
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

  // 2) parent
  const parentRaw = f.ParentCategory ?? f.ParentSlug;
  let parent = normalizeParentSlug(parentRaw, slug);

  // 3) inferencia de parent desde path/canonical
  if (!parent) {
    const inferred = inferParentFromPath(pathHint || f.Canonical, slug);
    parent = normalizeParentSlug(inferred, slug);
  }

  // 4) path
  const pathValue = normalizeCategoryPath(pathHint, slug, parent);

  const baseUrl = "https://reprodisseny.com";
  const canonicalUrl = `${baseUrl}${pathValue}`;

  const imageSrc = urlValue(f.ImageSrc) || urlValue(f.OgImageSrc);

  // Schema manual base
  const manualSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: toStr(f.Description),
    url: canonicalUrl,
    image: imageSrc,
    publisher: { "@type": "Organization", name: "Repro Disseny" },
  };

  const spSchema = parseJson(f.SchemaJson, {});
  const bodyMd = toStr(f.BodyMd);

  // TabsJson puede venir como array o como { tabs: [...] }
  const tabsJsonRaw = parseJson(f.TabsJson, null);
  const tabsJson =
    Array.isArray(tabsJsonRaw) ? tabsJsonRaw :
    Array.isArray(tabsJsonRaw?.tabs) ? tabsJsonRaw.tabs :
    [];

  const tabsFromBodyMd = buildTabsFromBodyMd(bodyMd);

  // Prioridad:
  // 1) TabsJson manual si existe
  // 2) fallback desde BodyMd (H2 => tabs)
  const tabs = tabsJson.length ? tabsJson : tabsFromBodyMd;

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

  const categoryFields = [
    "Title",
    "CategorySlug",
    "NavLabel",
    "SortOrder",
    "ParentCategory",
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

  // --- Validaciones útiles ---
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const orphans = categories.filter((c) => c.parent && !bySlug.has(c.parent));

  await fs.mkdir("cms", { recursive: true });

  if (orphans.length) {
    await fs.writeFile(
      "cms/orphan-categories.json",
      JSON.stringify(
        orphans.map((o) => ({ slug: o.slug, parent: o.parent, title: o.title })),
        null,
        2
      ),
      "utf8"
    );
    console.warn(
      "⚠️ Orphan categories (parent not found):",
      orphans.map((o) => `${o.slug} -> ${o.parent}`)
    );
  }

  const dupCat = findDuplicates(categories.map((c) => c.slug));
  const dupProd = findDuplicates(products.map((p) => p.slug));

  if (dupCat.length || dupProd.length) {
    const report = { dupCat, dupProd };
    await fs.writeFile("cms/slug-collisions.json", JSON.stringify(report, null, 2), "utf8");
    console.error("⛔ Slug collisions detected:", report);
    // process.exit(1); // opcional
  }

  const routes = [...categories.map((c) => c.path), ...products.map((p) => p.path)].sort();

  await fs.writeFile(
    "cms/catalog.json",
    JSON.stringify(
      { generatedAt: new Date().toISOString(), categories, products },
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