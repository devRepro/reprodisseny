import {
  createError,
  defineEventHandler,
  getRequestURL,
  sendRedirect,
} from "h3";

import catalog from "~/cms/catalog.json";

type CatalogCategory = {
  slug?: unknown;
  path?: unknown;
  legacySlugs?: unknown;
  isPublished?: unknown;
  hidden?: unknown;
};

type CatalogShape = {
  categories?: CatalogCategory[];
};

const CATEGORY_PREFIX = "/categorias/";
const PAYLOAD_OR_ASSET_RE =
  /(?:\/_payload\.json|\.(?:avif|css|gif|ico|jpe?g|js|json|map|pdf|png|svg|txt|webp|xml))$/i;

function normalizePath(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  let pathname = raw;

  try {
    if (/^https?:\/\//i.test(raw)) {
      pathname = new URL(raw).pathname;
    }
  } catch {
    return "";
  }

  const clean = pathname
    .split("#")[0]
    .split("?")[0]
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/\/+$/, "");

  if (!clean) return "/";
  return clean.startsWith("/") ? clean : `/${clean}`;
}

function toCategoryPath(value: unknown) {
  const path = normalizePath(value);
  if (!path) return "";
  if (path === "/categorias" || path.startsWith(CATEGORY_PREFIX)) return path;
  return normalizePath(`/categorias/${path.replace(/^\/+/, "")}`);
}

function buildCategoryRouteIndex() {
  const canonicalPaths = new Set<string>();
  const redirects = new Map<string, string>();
  const categories = Array.isArray((catalog as CatalogShape).categories)
    ? (catalog as CatalogShape).categories!
    : [];

  for (const category of categories) {
    if (category?.isPublished === false || category?.hidden === true) continue;

    const slug = String(category?.slug ?? "").trim();
    const canonical = toCategoryPath(category?.path || slug);
    if (!canonical || canonical === "/categorias") continue;

    canonicalPaths.add(canonical.toLowerCase());

    const aliases = [
      slug ? `/categorias/${slug}` : "",
      ...(Array.isArray(category?.legacySlugs) ? category.legacySlugs : []),
    ];

    for (const alias of aliases) {
      const aliasPath = toCategoryPath(alias);
      if (!aliasPath || aliasPath.toLowerCase() === canonical.toLowerCase()) continue;
      redirects.set(aliasPath.toLowerCase(), canonical);
    }
  }

  return { canonicalPaths, redirects };
}

const categoryRouteIndex = buildCategoryRouteIndex();

export default defineEventHandler((event) => {
  if (event.method !== "GET" && event.method !== "HEAD") return;

  const pathname = getRequestURL(event).pathname;
  if (!pathname.startsWith(CATEGORY_PREFIX) || PAYLOAD_OR_ASSET_RE.test(pathname)) {
    return;
  }

  const normalizedPath = normalizePath(pathname);
  const lookupPath = normalizedPath.toLowerCase();
  const redirectTo = categoryRouteIndex.redirects.get(lookupPath);

  if (redirectTo) {
    return sendRedirect(event, redirectTo, 301);
  }

  if (categoryRouteIndex.canonicalPaths.has(lookupPath)) {
    if (pathname !== normalizedPath) {
      return sendRedirect(event, normalizedPath, 301);
    }

    return;
  }

  throw createError({
    statusCode: 404,
    statusMessage: "Categoría no encontrada",
    message: `No existe una categoría publicada para la ruta ${normalizedPath}`,
  });
});
