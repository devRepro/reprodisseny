import {
  defineEventHandler,
  getRequestURL,
  sendRedirect,
} from "h3";

import catalog from "~/cms/catalog.json";

type CatalogProduct = {
  slug?: unknown;
  path?: unknown;
  legacySlugs?: unknown;
  isPublished?: unknown;
  hidden?: unknown;
};

type CatalogShape = {
  products?: CatalogProduct[];
};

const PRODUCT_PREFIX = "/productos/";
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

function toProductPath(value: unknown) {
  const path = normalizePath(value);
  if (!path) return "";
  if (path === "/productos" || path.startsWith(PRODUCT_PREFIX)) return path;
  return normalizePath(`/productos/${path.replace(/^\/+/, "")}`);
}

function buildProductRouteIndex() {
  const routes = new Map<string, string>();
  const products = Array.isArray((catalog as CatalogShape).products)
    ? (catalog as CatalogShape).products!
    : [];

  for (const product of products) {
    if (product?.isPublished === false || product?.hidden === true) continue;

    const canonical = toProductPath(product?.path || product?.slug);
    if (!canonical || canonical === "/productos") continue;

    const aliases = [
      canonical,
      product?.slug ? `/productos/${String(product.slug).trim()}` : "",
      ...(Array.isArray(product?.legacySlugs) ? product.legacySlugs : []),
    ];

    for (const alias of aliases) {
      const aliasPath = toProductPath(alias);
      if (!aliasPath) continue;
      routes.set(aliasPath.toLowerCase(), canonical);
    }
  }

  return routes;
}

const productRoutes = buildProductRouteIndex();

export default defineEventHandler((event) => {
  if (event.method !== "GET" && event.method !== "HEAD") return;

  const requestUrl = getRequestURL(event);
  const pathname = requestUrl.pathname;

  if (!pathname.startsWith(PRODUCT_PREFIX) || PAYLOAD_OR_ASSET_RE.test(pathname)) {
    return;
  }

  const normalizedPath = normalizePath(pathname);
  const canonicalPath = productRoutes.get(normalizedPath.toLowerCase());

  if (!canonicalPath) return;

  if (pathname !== canonicalPath) {
    return sendRedirect(event, `${canonicalPath}${requestUrl.search}`, 301);
  }
});
