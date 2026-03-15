export function normalizeCategoryPath(input: unknown) {
  let s = String(input ?? "").trim()
  if (!s) return ""

  s = s.replace(/^https?:\/\/[^/]+/i, "")
  s = s.replace(/^\/+|\/+$/g, "")

  if (s.startsWith("categorias/")) {
    s = s.replace(/^categorias\//i, "")
  }

  return s
}

function isCategoryLikePath(input: unknown) {
  const s = String(input ?? "").trim()
  if (!s) return false

  // rutas canónicas de categoría
  if (/^\/?categorias\//i.test(s)) return true

  // slugs o paths relativos de categorías
  if (/^[a-z0-9-]+(\/[a-z0-9-]+)*$/i.test(s)) return true

  return false
}

export function categoryHref(cat: any) {
  const explicitCandidates = [
    cat?.canonicalPath,
    cat?.categoryPath,
    cat?.slugPath,
    cat?.fullPath,
  ]

  const explicit = explicitCandidates.find((value) => isCategoryLikePath(value))
  if (explicit) {
    return `/categorias/${normalizeCategoryPath(explicit)}`
  }

  if (typeof cat?.slug === "string" && /^[a-z0-9-]+$/i.test(cat.slug.trim())) {
    return `/categorias/${cat.slug.trim().toLowerCase()}`
  }

  return "/categorias"
}