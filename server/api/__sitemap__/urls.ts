// server/api/__sitemap__/urls.ts
import { defineSitemapEventHandler } from "#imports";
import type { SitemapUrlInput } from "#sitemap/types";

import routes from "~/cms/routes.json";
import catalog from "~/cms/catalog.json";

const SITE_URL = "https://reprodisseny.com";
const MEDIA_BLOB_ORIGIN = "https://webcms.blob.core.windows.net";
const MEDIA_CDN_ORIGIN = "https://media.reprodisseny.com";

const excludedExactPaths = new Set([
  "/gracias",
]);

const excludedPrefixes = [
  "/api",
  "/admin",
  "/panel",
];

type UnknownRecord = Record<string, unknown>;

type SitemapCatalogEntry = {
  path?: unknown;
  slug?: unknown;
  updatedAt?: unknown;
  publishedAt?: unknown;
  modifiedAt?: unknown;
  createdAt?: unknown;
  image?: {
    src?: unknown;
  } | null;
  galleryImages?: Array<{
    src?: unknown;
  }> | null;
  seo?: {
    ogImageSrc?: unknown;
  } | null;
};

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeSitemapPath(value: unknown) {
  if (typeof value !== "string") return null;

  const cleanPath = value
    .trim()
    .split("#")[0]
    .split("?")[0];

  if (!cleanPath.startsWith("/")) return null;

  if (cleanPath === "/") return "/";

  return cleanPath.replace(/\/+$/, "");
}

function isAllowedPath(path: string) {
  if (excludedExactPaths.has(path)) return false;

  return !excludedPrefixes.some((prefix) => {
    return path === prefix || path.startsWith(`${prefix}/`);
  });
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string") return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

function normalizeImageUrl(value: unknown) {
  if (typeof value !== "string") return null;

  let src = value.trim();

  if (!src) return null;

  src = src.split("#")[0]?.trim() || "";
  src = src.split("?")[0]?.trim() || "";

  if (!src) return null;

  if (src.startsWith("/")) {
    return `${SITE_URL}${src}`;
  }

  try {
    const url = new URL(src);

    if (url.origin === MEDIA_BLOB_ORIGIN) {
      return `${MEDIA_CDN_ORIGIN}${url.pathname}`;
    }

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }

    return null;
  } catch {
    return null;
  }
}

function getCatalogCollections() {
  const data = catalog as unknown;

  if (!isRecord(data)) {
    return [];
  }

  const collections = [
    data.categories,
    data.products,
  ];

  return collections
    .filter(Array.isArray)
    .flat() as SitemapCatalogEntry[];
}

function getEntryPath(entry: SitemapCatalogEntry) {
  return normalizeSitemapPath(entry.path);
}

function getEntryLastmod(entry: SitemapCatalogEntry) {
  return (
    normalizeDate(entry.updatedAt) ||
    normalizeDate(entry.modifiedAt) ||
    normalizeDate(entry.publishedAt) ||
    normalizeDate(entry.createdAt) ||
    undefined
  );
}

function getEntryImages(entry: SitemapCatalogEntry) {
  const candidates = [
    entry.seo?.ogImageSrc,
    entry.image?.src,
    ...(Array.isArray(entry.galleryImages)
      ? entry.galleryImages.slice(0, 2).map((item) => item?.src)
      : []),
  ];

  const seen = new Set<string>();

  return candidates
    .map(normalizeImageUrl)
    .filter((src): src is string => Boolean(src))
    .filter((src) => {
      if (seen.has(src)) return false;
      seen.add(src);
      return true;
    })
    .slice(0, 3)
    .map((loc) => ({ loc }));
}

function buildCatalogIndex() {
  const index = new Map<
    string,
    {
      lastmod?: string;
      images?: Array<{ loc: string }>;
    }
  >();

  for (const entry of getCatalogCollections()) {
    const path = getEntryPath(entry);

    if (!path || !isAllowedPath(path)) continue;

    const lastmod = getEntryLastmod(entry);
    const images = getEntryImages(entry);

    index.set(path, {
      ...(lastmod ? { lastmod } : {}),
      ...(images.length ? { images } : {}),
    });
  }

  return index;
}

export default defineSitemapEventHandler(() => {
  const seen = new Set<string>();
  const catalogIndex = buildCatalogIndex();

  const urls: SitemapUrlInput[] = (routes as unknown[])
    .map(normalizeSitemapPath)
    .filter((path): path is string => Boolean(path))
    .filter(isAllowedPath)
    .filter((path) => {
      if (seen.has(path)) return false;
      seen.add(path);
      return true;
    })
    .map((path) => {
      const extra = catalogIndex.get(path);

      return {
        loc: path,
        ...(extra?.lastmod ? { lastmod: extra.lastmod } : {}),
        ...(extra?.images?.length ? { images: extra.images } : {}),
      } satisfies SitemapUrlInput;
    });

  return urls;
});