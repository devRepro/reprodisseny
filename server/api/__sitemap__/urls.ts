// server/api/__sitemap__/urls.ts
import { defineSitemapEventHandler } from "#imports";
import type { SitemapUrlInput } from "#sitemap/types";
import routes from "~/cms/routes.json";

const excludedExactPaths = new Set([
  "/gracias",
]);

const excludedPrefixes = [
  "/api",
  "/admin",
  "/panel",
];

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

export default defineSitemapEventHandler(() => {
  const seen = new Set<string>();

  const urls: SitemapUrlInput[] = (routes as unknown[])
    .map(normalizeSitemapPath)
    .filter((path): path is string => Boolean(path))
    .filter(isAllowedPath)
    .filter((path) => {
      if (seen.has(path)) return false;
      seen.add(path);
      return true;
    })
    .map((path) => ({
      loc: path,
    }));

  return urls;
});