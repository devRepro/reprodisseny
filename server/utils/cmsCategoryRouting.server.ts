// server/utils/cmsCategoryRouting.server.ts
type AnyObj = Record<string, any>

function normSlug(v: unknown) {
  let s = String(v ?? "").trim()
  if (!s) return ""
  s = s.replace(/^\/+/, "")
  s = s.replace(/^\/?categorias\//i, "")
  s = s.replace(/^categorias\//i, "")
  s = s.replace(/^\/+|\/+$/g, "")
  return s
}

function normPath(v: unknown) {
  let s = String(v ?? "").trim()
  if (!s) return ""
  if (!s.startsWith("/")) s = "/" + s
  s = s.replace(/\/{2,}/g, "/")
  if (!s.startsWith("/categorias/")) s = "/categorias/" + s.replace(/^\/+/, "")
  return s.replace(/\/+$/, "")
}

const LEGACY_CATEGORY_ALIASES: Record<string, string> = {
  adhesivos: "/categorias/adhesivos-personalizados",
  "/categorias/adhesivos": "/categorias/adhesivos-personalizados",
}

function categoryAliases(c: AnyObj) {
  const raw = [
    ...(Array.isArray(c?.aliases) ? c.aliases : []),
    ...(Array.isArray(c?.redirectFrom) ? c.redirectFrom : []),
    c?.legacySlug,
    c?.LegacySlug,
    c?.legacyPath,
    c?.LegacyPath,
  ].filter(Boolean)

  return raw.map(String)
}

export function resolveCategoryRoute(
  categories: AnyObj[],
  byPath: Map<string, any> | undefined,
  bySlug: Map<string, any> | undefined,
  requested: string
) {
  const wantedPath = normPath(requested)
  const wantedSlug = normSlug(requested)

  const direct =
    byPath?.get(wantedPath) ||
    bySlug?.get(wantedSlug) ||
    categories.find((c) => normPath(c?.path) === wantedPath) ||
    categories.find((c) => normSlug(c?.slug || c?.categorySlug) === wantedSlug)

  if (direct) {
    const canonicalPath = normPath(direct?.path)
    return {
      category: direct,
      canonicalPath,
      redirectTo: canonicalPath !== wantedPath ? canonicalPath : undefined,
      matchedBy: "direct",
    }
  }

  const aliasTarget =
    LEGACY_CATEGORY_ALIASES[wantedPath] ||
    LEGACY_CATEGORY_ALIASES[wantedSlug]

  if (aliasTarget) {
    const canonicalPath = normPath(aliasTarget)
    const canonicalSlug = normSlug(aliasTarget)

    const aliased =
      byPath?.get(canonicalPath) ||
      bySlug?.get(canonicalSlug) ||
      categories.find((c) => normPath(c?.path) === canonicalPath) ||
      categories.find((c) => normSlug(c?.slug || c?.categorySlug) === canonicalSlug)

    if (aliased) {
      return {
        category: aliased,
        canonicalPath,
        redirectTo: canonicalPath,
        matchedBy: "legacy-map",
      }
    }
  }

  for (const c of categories || []) {
    const aliases = categoryAliases(c)
    const hit = aliases.some((a) => normPath(a) === wantedPath || normSlug(a) === wantedSlug)

    if (hit) {
      const canonicalPath = normPath(c?.path)
      return {
        category: c,
        canonicalPath,
        redirectTo: canonicalPath,
        matchedBy: "cms-alias",
      }
    }
  }

  return null
}