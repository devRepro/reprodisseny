import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function normalizePath(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  let pathname = raw;

  try {
    if (/^https?:\/\//i.test(raw)) pathname = new URL(raw).pathname;
  } catch {
    return "";
  }

  const normalized = pathname
    .split("#")[0]
    .split("?")[0]
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/\/+$/, "");

  if (!normalized) return "/";
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function isPublished(item) {
  return item?.isPublished !== false && item?.hidden !== true;
}

async function readJson(relativePath) {
  const source = await readFile(path.join(rootDir, relativePath), "utf8");
  return JSON.parse(source);
}

function collectCatalogPaths(catalog) {
  const categories = Array.isArray(catalog?.categories)
    ? catalog.categories.filter(isPublished)
    : [];
  const products = Array.isArray(catalog?.products)
    ? catalog.products.filter((item) => item?.isPublished !== false)
    : [];

  return new Set(
    [...categories, ...products]
      .map((item) => normalizePath(item?.path))
      .filter((item) => item.startsWith("/categorias/") || item.startsWith("/productos/")),
  );
}

async function findNonCanonicalCategoryLinks(canonicalCategoryPaths) {
  const files = await fg(
    [
      "app.vue",
      "error.vue",
      "components/**/*.{ts,vue}",
      "layouts/**/*.{ts,vue}",
      "pages/**/*.{ts,vue}",
    ],
    {
      cwd: rootDir,
      absolute: true,
      onlyFiles: true,
      ignore: ["**/node_modules/**", "**/.nuxt/**", "**/.output/**"],
    },
  );

  const invalid = [];
  const literalCategoryPath = /["'`](\/categorias\/[a-z0-9][a-z0-9/_-]*)["'`]/gi;

  for (const filename of files) {
    const source = await readFile(filename, "utf8");

    for (const match of source.matchAll(literalCategoryPath)) {
      const route = normalizePath(match[1]);
      if (canonicalCategoryPaths.has(route)) continue;

      const line = source.slice(0, match.index).split("\n").length;
      invalid.push(`${path.relative(rootDir, filename)}:${line} -> ${route}`);
    }
  }

  return invalid;
}

const catalog = await readJson("cms/catalog.json");
const routes = await readJson("cms/routes.json");

const canonicalCatalogPaths = collectCatalogPaths(catalog);
const canonicalCategoryPaths = new Set(
  [...canonicalCatalogPaths].filter((route) => route.startsWith("/categorias/")),
);
const sitemapRoutes = new Set(
  (Array.isArray(routes) ? routes : []).map(normalizePath).filter(Boolean),
);

const missingFromSitemap = [...canonicalCatalogPaths]
  .filter((route) => !sitemapRoutes.has(route))
  .sort();

const staleSitemapRoutes = [...sitemapRoutes]
  .filter(
    (route) =>
      (route.startsWith("/categorias/") || route.startsWith("/productos/")) &&
      !canonicalCatalogPaths.has(route),
  )
  .sort();

const nonCanonicalCategoryLinks = await findNonCanonicalCategoryLinks(
  canonicalCategoryPaths,
);

const failures = [];

if (missingFromSitemap.length) {
  failures.push(
    `Rutas publicadas ausentes de cms/routes.json:\n- ${missingFromSitemap.join("\n- ")}`,
  );
}

if (staleSitemapRoutes.length) {
  failures.push(
    `Rutas obsoletas presentes en cms/routes.json:\n- ${staleSitemapRoutes.join("\n- ")}`,
  );
}

if (nonCanonicalCategoryLinks.length) {
  failures.push(
    `Enlaces internos de categoría no canónicos:\n- ${nonCanonicalCategoryLinks.join("\n- ")}`,
  );
}

if (failures.length) {
  console.error(`\nSEO route validation failed\n\n${failures.join("\n\n")}\n`);
  process.exitCode = 1;
} else {
  console.log(
    `SEO routes OK: ${canonicalCatalogPaths.size} rutas de catálogo y ${canonicalCategoryPaths.size} categorías canónicas validadas.`,
  );
}
