import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productionOrigin = "https://reprodisseny.com";

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
    ? catalog.products.filter(isPublished)
    : [];

  return new Set(
    [...categories, ...products]
      .map((item) => normalizePath(item?.path))
      .filter((item) => item.startsWith("/categorias/") || item.startsWith("/productos/")),
  );
}

function validateCatalogCanonicals(catalog) {
  const failures = [];
  const canonicalOwners = new Map();
  const publishedEntries = [
    ...(Array.isArray(catalog?.categories) ? catalog.categories.filter(isPublished) : []),
    ...(Array.isArray(catalog?.products) ? catalog.products.filter(isPublished) : []),
  ];

  for (const entry of publishedEntries) {
    const entryPath = normalizePath(entry?.path);
    const rawCanonical = String(entry?.seo?.canonical ?? "").trim();
    let canonical;

    try {
      canonical = new URL(rawCanonical);
    } catch {
      failures.push(`${entry?.slug || entry?.id}: canonical inválido (${rawCanonical || "vacío"})`);
      continue;
    }

    const canonicalPath = normalizePath(canonical.pathname);
    if (canonical.origin !== productionOrigin) {
      failures.push(`${entry?.slug || entry?.id}: canonical fuera de producción (${rawCanonical})`);
    }
    if (canonicalPath !== entryPath) {
      failures.push(`${entry?.slug || entry?.id}: canonical incompatible con path (${canonicalPath} != ${entryPath})`);
    }
    if (canonicalPath.startsWith("/product/")) {
      failures.push(`${entry?.slug || entry?.id}: canonical legacy (${rawCanonical})`);
    }
    if (!canonicalPath.startsWith("/productos/") && !canonicalPath.startsWith("/categorias/")) {
      failures.push(`${entry?.slug || entry?.id}: canonical fuera de las rutas públicas de catálogo (${rawCanonical})`);
    }

    const previousOwner = canonicalOwners.get(rawCanonical);
    if (previousOwner) {
      failures.push(`canonical duplicado ${rawCanonical}: ${previousOwner}, ${entry?.slug || entry?.id}`);
    } else {
      canonicalOwners.set(rawCanonical, entry?.slug || entry?.id);
    }
  }

  return failures;
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
const canonicalFailures = validateCatalogCanonicals(catalog);

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

if (canonicalFailures.length) {
  failures.push(`Canonicals de catálogo inválidos:\n- ${canonicalFailures.join("\n- ")}`);
}

if (failures.length) {
  console.error(`\nSEO route validation failed\n\n${failures.join("\n\n")}\n`);
  process.exitCode = 1;
} else {
  console.log(
    `SEO routes OK: ${canonicalCatalogPaths.size} rutas de catálogo y ${canonicalCategoryPaths.size} categorías canónicas validadas.`,
  );
}
