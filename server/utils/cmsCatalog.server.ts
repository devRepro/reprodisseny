import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { mapCategoryContent } from "~/shared/utils/cms/mapCategoryContent";
import { mapProductContent } from "~/shared/utils/cms/mapProductContent";

type CmsCatalog = {
  categories: any[];
  products: any[];
  __index?: {
    byPath: Map<string, any>;
    bySlug: Map<string, any>;
  };
};

let cache: CmsCatalog | null = null;
let cacheAt = 0;
let cacheMtimeMs = 0;

const DEV_TTL_MS = 5_000;
const PROD_TTL_MS = 60_000;

function normSlug(v: unknown) {
  let s = String(v ?? "").trim();
  if (!s) return "";
  s = s.replace(/^\/+/, "");
  s = s.replace(/^\/?categorias\//i, "");
  s = s.replace(/^categorias\//i, "");
  s = s.replace(/^\/+|\/+$/g, "");
  return s;
}

function normPath(v: unknown) {
  let s = String(v ?? "").trim();
  if (!s) return "";
  if (!s.startsWith("/")) s = "/" + s;
  s = s.replace(/\/{2,}/g, "/");
  if (!s.startsWith("/categorias/")) s = "/categorias/" + s.replace(/^\/+/, "");
  return s.replace(/\/+$/, "");
}

function normCategorySlug(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

function parseCategoriesValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(normCategorySlug).filter(Boolean);
  }

  if (typeof value !== "string") return [];

  const raw = value.trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(normCategorySlug).filter(Boolean);
    }
  } catch {
    // legacy fallback
  }

  return raw
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .replace(/"/g, "")
    .replace(/'/g, "")
    .split(/[;,]/)
    .map((v) => normCategorySlug(v))
    .filter(Boolean);
}

function uniqueStrings(values: unknown[]) {
  return [...new Set(values.map(normCategorySlug).filter(Boolean))];
}

function firstNonEmpty(obj: any, keys: string[], fallback: any = undefined) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
}

function buildIndex(categories: any[]) {
  const byPath = new Map<string, any>();
  const bySlug = new Map<string, any>();

  for (const category of categories) {
    if (!category) continue;

    const pathKey = normPath(category?.path);
    if (pathKey && !byPath.has(pathKey)) {
      byPath.set(pathKey, category);
    }

    const mainSlug = normSlug(category?.slug);
    if (mainSlug && !bySlug.has(mainSlug)) {
      bySlug.set(mainSlug, category);
    }

    const legacy = Array.isArray(category?.legacySlugs)
      ? category.legacySlugs.map(normSlug)
      : [];
    for (const slug of legacy) {
      if (slug && !bySlug.has(slug)) bySlug.set(slug, category);
    }

    const extra = Array.isArray(category?.slugs) ? category.slugs.map(normSlug) : [];
    for (const slug of extra) {
      if (slug && !bySlug.has(slug)) bySlug.set(slug, category);
    }
  }

  return { byPath, bySlug };
}

function hydrateCategory(category: any) {
  const fallbackPath = category?.slug
    ? `/categorias/${normSlug(category.slug)}`
    : category?.path || "";

  category.path = normPath(category?.path || fallbackPath);

  const content = mapCategoryContent(category);

  category.bodyMd = content.bodyMd;
  category.sections = content.sections;
  category.tabs = content.tabs; // compatibilidad con la UI actual de categoría

  return category;
}

function normalizeProduct(product: any) {
  const primaryCategory = normCategorySlug(
    firstNonEmpty(product, ["primaryCategory", "PrimaryCategory"], "")
  );

  const secondaryCategories = parseCategoriesValue(
    firstNonEmpty(product, ["categories", "Categories"], [])
  ).filter((slug) => slug !== primaryCategory);

  const categorySlugs = uniqueStrings([primaryCategory, ...secondaryCategories]);

  return {
    ...product,
    primaryCategory,
    categories: secondaryCategories,
    categorySlugs,
  };
}

function hydrateProduct(product: any) {
  const normalized = normalizeProduct(product);
  const content = mapProductContent(normalized);

  return {
    ...normalized,
    bodyMd: content.bodyMd,
    sections: content.sections,
    faqs: content.faqs,
  };
}

function prepareCatalog(raw: any): CmsCatalog {
  const categoriesRaw = Array.isArray(raw?.categories) ? raw.categories : [];
  const productsRaw = Array.isArray(raw?.products) ? raw.products : [];

  const categories = categoriesRaw.map(hydrateCategory);
  const products = productsRaw.map(hydrateProduct);

  const out: CmsCatalog = { categories, products };

  Object.defineProperty(out, "__index", {
    value: buildIndex(categories),
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return out;
}

export async function getCmsCatalog(): Promise<CmsCatalog> {
  const isDev = process.env.NODE_ENV !== "production";
  const ttl = isDev ? DEV_TTL_MS : PROD_TTL_MS;
  const filePath = join(process.cwd(), "cms", "catalog.json");

  if (cache && Date.now() - cacheAt < ttl) {
    try {
      const st = await stat(filePath);
      if (st.mtimeMs <= cacheMtimeMs) return cache;
    } catch {
      // seguimos y recargamos
    }
  }

  try {
    const st = await stat(filePath);
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);

    cache = prepareCatalog(parsed);
    cacheAt = Date.now();
    cacheMtimeMs = st.mtimeMs;

    return cache;
  } catch (e: any) {
    const msg =
      e?.code === "ENOENT"
        ? "No existe cms/catalog.json. ¿Has ejecutado el script de sync?"
        : `Error leyendo cms/catalog.json: ${e?.message || String(e)}`;

    throw new Error(msg);
  }
}

export function clearCmsCatalogCache() {
  cache = null;
  cacheAt = 0;
  cacheMtimeMs = 0;
}