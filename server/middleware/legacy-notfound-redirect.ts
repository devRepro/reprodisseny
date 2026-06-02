// ~/server/middleware/legacy-notfound-redirect.ts
import {
  createError,
  defineEventHandler,
  getQuery,
  getRequestURL,
  sendRedirect,
} from "h3"

import { redirectRouteRules } from "../../redirect-rules.generated"

/**
 * Limpieza SEO de URLs legacy para Google Search Console.
 *
 * Responsabilidades:
 * - Resolver /error/notfound?aspxerrorpath=/ruta-antigua.
 * - Devolver 410 Gone para endpoints/descargas/feed legacy sin equivalente real.
 * - Canonicalizar hosts legacy hacia https://reprodisseny.com.
 * - Redirigir queries legacy conocidas hacia URLs limpias.
 *
 * Mantener los 301 con equivalente real en redirect-rules.generated.ts.
 */

const CANONICAL_ORIGIN = "https://reprodisseny.com"

const LEGACY_HOSTS = new Set([
  "www.reprodisseny.com",
  "demo.reprodisseny.com",
  "blog.reprodisseny.com",
  "calendarios.reprodisseny.com",
])

const LEGACY_GONE_PREFIXES = [
  "/assets/Download/",
  "/DefaultCaptcha/",
  "/Cart/",
  "/cart/",
  "/author/",
  "/tag/",
] as const

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
])

type RedirectRule = {
  redirect?: {
    to?: string
    statusCode?: number
  }
}

const routeRules = redirectRouteRules as unknown as Record<string, RedirectRule>

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function normalizeLegacyPath(value: unknown) {
  const rawValue = Array.isArray(value) ? value[0] : value

  if (!rawValue) return ""

  let path = String(rawValue).trim()

  if (!path) return ""

  path = safeDecodeURIComponent(path)

  try {
    if (/^https?:\/\//i.test(path)) {
      path = new URL(path).pathname
    }
  } catch {
    // Seguimos normalizando como path.
  }

  path = path.split("#")[0] ?? ""
  path = path.split("?")[0] ?? ""

  if (!path.startsWith("/")) {
    path = `/${path}`
  }

  path = path.replace(/\/{2,}/g, "/")

  if (path.length > 1) {
    path = path.replace(/\/+$/, "")
  }

  return path
}

function isSafeInternalDestination(destination: string) {
  return destination.startsWith("/") && !destination.startsWith("//")
}

function getMappedRedirect(path: string) {
  const rule = routeRules[path]
  const destination = rule?.redirect?.to

  if (!destination) return null
  if (!isSafeInternalDestination(destination)) return null
  if (destination === path) return null

  return {
    to: destination,
    statusCode: rule?.redirect?.statusCode ?? 301,
  }
}

function isLegacyGonePath(path: string) {
  if (LEGACY_GONE_PATHS.has(path)) return true

  return LEGACY_GONE_PREFIXES.some((prefix) => path.startsWith(prefix))
}

function isCurrentCatalogPath(path: string) {
  return path.startsWith("/productos/") || path.startsWith("/categorias/")
}

function resolveLegacyRootQuery(url: URL) {
  const version = url.searchParams.get("ver")
  if (url.pathname === "/" && version) return "/"

  const productCategory = url.searchParams.get("product_cat")
  if (productCategory === "gran-formato") return "/categorias/gran-formato"

  return null
}

function toCanonicalUrl(path: string) {
  return `${CANONICAL_ORIGIN}${path}`
}

function redirectInternalOrCanonical(
  event: Parameters<typeof sendRedirect>[0],
  path: string,
  options: {
    forceCanonical: boolean
    statusCode?: number
  },
) {
  const statusCode = options.statusCode ?? 301

  if (options.forceCanonical) {
    return sendRedirect(event, toCanonicalUrl(path), statusCode)
  }

  return sendRedirect(event, path, statusCode)
}

function throwGone() {
  throw createError({
    statusCode: 410,
    statusMessage: "Gone",
  })
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const currentPath = normalizeLegacyPath(url.pathname)
  const isLegacyHost = LEGACY_HOSTS.has(url.hostname)

  const rootQueryDestination = resolveLegacyRootQuery(url)

  if (rootQueryDestination) {
    return redirectInternalOrCanonical(event, rootQueryDestination, {
      forceCanonical: isLegacyHost,
      statusCode: 301,
    })
  }

  if (isLegacyGonePath(currentPath)) {
    return throwGone()
  }

  if (currentPath === "/error/notfound") {
    const query = getQuery(event)
    const legacyPath = normalizeLegacyPath(query.aspxerrorpath)

    if (!legacyPath || isLegacyGonePath(legacyPath)) {
      return throwGone()
    }

    const mappedLegacyDestination = getMappedRedirect(legacyPath)

    if (mappedLegacyDestination) {
      return redirectInternalOrCanonical(event, mappedLegacyDestination.to, {
        forceCanonical: isLegacyHost,
        statusCode: mappedLegacyDestination.statusCode,
      })
    }

    if (isCurrentCatalogPath(legacyPath)) {
      return redirectInternalOrCanonical(event, legacyPath, {
        forceCanonical: isLegacyHost,
        statusCode: 301,
      })
    }

    return throwGone()
  }

  const mappedDestination = getMappedRedirect(currentPath)

  if (mappedDestination) {
    return redirectInternalOrCanonical(event, mappedDestination.to, {
      forceCanonical: isLegacyHost,
      statusCode: mappedDestination.statusCode,
    })
  }

  if (isLegacyHost) {
    return sendRedirect(event, toCanonicalUrl(currentPath === "/" ? "/" : currentPath), 301)
  }
})