import { createError, getQuery, getRequestURL, sendRedirect } from "h3";
import { redirectRouteRules } from "../../redirect-rules.generated";

/**
 * Limpieza SEO de URLs legacy para Google Search Console.
 *
 * Responsabilidades:
 * - Resolver /error/notfound?aspxerrorpath=/ruta-antigua.
 * - Devolver 410 Gone para endpoints/descargas/feed legacy sin equivalente real.
 * - Canonicalizar hosts legacy hacia https://reprodisseny.com.
 * - Redirigir ?ver=... de WordPress en la home hacia la home limpia.
 *
 * Mantener los 301 con equivalente real en redirect-rules.generated.ts.
 */

const CANONICAL_ORIGIN = "https://reprodisseny.com";
const LEGACY_HOSTS = new Set([
  "www.reprodisseny.com",
  "demo.reprodisseny.com",
  "blog.reprodisseny.com",
  "calendarios.reprodisseny.com",
]);

const LEGACY_GONE_PREFIXES = [
  "/assets/Download/",
  "/DefaultCaptcha/",
  "/Cart/",
  "/author/",
  "/tag/",
] as const;

const LEGACY_GONE_PATHS = new Set([
  "/Content/404.html",
  "/Orders/GetOrderItemProofFiles",
  "/feed",
  "/productfileupload",
  "/savedforlater",
  "/settings",
  "/blog",
  "/page/escoles",
  "/adevinta-estrena-nuevas-oficinas",
  "/adevinta-estrena-nuevas-oficines",
  "/web2print-corporativa-adevinta",
]);

type RedirectRule = {
  redirect?: {
    to?: string;
    statusCode?: number;
  };
};

const routeRules = redirectRouteRules as unknown as Record<string, RedirectRule>;

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeLegacyPath(value: unknown) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) return "";

  let path = String(rawValue).trim();

  if (!path) return "";

  path = safeDecodeURIComponent(path);

  try {
    if (/^https?:\/\//i.test(path)) {
      path = new URL(path).pathname;
    }
  } catch {
    // Seguimos normalizando como path.
  }

  path = path.split("#")[0] ?? "";
  path = path.split("?")[0] ?? "";

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  path = path.replace(/\/{2,}/g, "/");

  if (path.length > 1) {
    path = path.replace(/\/+$/, "");
  }

  return path;
}

function isSafeInternalDestination(destination: string) {
  return destination.startsWith("/") && !destination.startsWith("//");
}

function getMappedRedirect(path: string) {
  const rule = routeRules[path];
  const destination = rule?.redirect?.to;

  if (!destination) return null;
  if (!isSafeInternalDestination(destination)) return null;
  if (destination === path) return null;

  return destination;
}

function isLegacyGonePath(path: string) {
  if (LEGACY_GONE_PATHS.has(path)) return true;

  return LEGACY_GONE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function isCurrentCatalogPath(path: string) {
  return path.startsWith("/productos/") || path.startsWith("/categorias/");
}

function resolveLegacyRootQuery(url: URL) {
  const version = url.searchParams.get("ver");
  if (url.pathname === "/" && version) return "/";

  const productCategory = url.searchParams.get("product_cat");
  if (productCategory === "gran-formato") return "/categorias/gran-formato";

  return null;
}

function redirectToCanonical(event: Parameters<typeof sendRedirect>[0], path: string, statusCode = 301) {
  return sendRedirect(event, `${CANONICAL_ORIGIN}${path}`, statusCode);
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const currentPath = normalizeLegacyPath(url.pathname);
  const isLegacyHost = LEGACY_HOSTS.has(url.hostname);

  const rootQueryDestination = resolveLegacyRootQuery(url);
  if (rootQueryDestination) {
    return isLegacyHost
      ? redirectToCanonical(event, rootQueryDestination, 301)
      : sendRedirect(event, rootQueryDestination, 301);
  }

  if (isLegacyGonePath(currentPath)) {
    throw createError({
      statusCode: 410,
      statusMessage: "Gone",
    });
  }

  if (currentPath === "/error/notfound") {
    const query = getQuery(event);
    const legacyPath = normalizeLegacyPath(query.aspxerrorpath);

    if (!legacyPath || isLegacyGonePath(legacyPath)) {
      throw createError({
        statusCode: 410,
        statusMessage: "Gone",
      });
    }

    const destination = getMappedRedirect(legacyPath);

    if (destination) {
      return isLegacyHost
        ? redirectToCanonical(event, destination, 301)
        : sendRedirect(event, destination, 301);
    }

    if (isCurrentCatalogPath(legacyPath)) {
      return isLegacyHost
        ? redirectToCanonical(event, legacyPath, 301)
        : sendRedirect(event, legacyPath, 301);
    }

    throw createError({
      statusCode: 410,
      statusMessage: "Gone",
    });
  }

  const mappedDestination = getMappedRedirect(currentPath);

  if (isLegacyHost) {
    if (mappedDestination) {
      return redirectToCanonical(event, mappedDestination, 301);
    }

    return redirectToCanonical(event, currentPath === "/" ? "/" : currentPath, 301);
  }
});
