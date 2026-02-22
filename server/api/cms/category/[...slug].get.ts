// server/api/cms/category/[...slug].get.ts
import { defineEventHandler, getRouterParam, getQuery, createError } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"
import { parseTabsJson, normalizeTabs } from "~/utils/tabsJson"

function normalizeSlug(v: unknown) {
  let s = String(v ?? "").trim()
  if (!s) return ""
  s = s.replace(/^\/+/, "")
  s = s.replace(/^\/?categorias\//i, "")
  s = s.replace(/^categorias\//i, "")
  s = s.replace(/^\/+|\/+$/g, "")
  return s
}

function normalizePath(v: unknown) {
  let s = String(v ?? "").trim()
  if (!s) return ""
  if (!s.startsWith("/")) s = "/" + s
  s = s.replace(/\/{2,}/g, "/")
  if (!s.startsWith("/categorias/")) s = "/categorias/" + s.replace(/^\/+/, "")
  return s.replace(/\/+$/, "")
}

function stripCategoriasPrefix(path: string) {
  return String(path || "")
    .replace(/^\/+/, "/")
    .replace(/^\/categorias\//i, "")
    .replace(/\/+$/, "")
}

function computeRobots(c: any) {
  if (c?.hidden) return "noindex,follow"

  const override = String(c?.seo?.robotsOverride ?? c?.RobotsOverride ?? "INHERIT").toUpperCase().trim()
  let base = "index,follow"

  if (override === "NOINDEX_FOLLOW") base = "noindex,follow"
  else if (override === "NOINDEX_NOFOLLOW") base = "noindex,nofollow"
  else if (override === "INDEX_NOFOLLOW") base = "index,nofollow"
  else if (override === "INDEX_FOLLOW") base = "index,follow"
  else if (override === "INHERIT") base = "index,follow"

  const adv = String(c?.seo?.robotsAdvanced ?? c?.RobotsAdvanced ?? "").trim()
  return adv ? `${base},${adv}` : base
}

function clampInt(v: unknown, fallback: number, min: number, max: number) {
  const n = parseInt(String(v ?? ""), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

export default defineEventHandler(async (event) => {
  const raw = getRouterParam(event, "slug") || ""
  const slugParts = String(raw).split("/").filter(Boolean)

  const wantedPath = normalizePath("/categorias/" + slugParts.join("/"))
  const wantedSlug = normalizeSlug(slugParts[slugParts.length - 1] || "")

  const q = getQuery(event) as any
  const includeProducts = String(q.includeProducts ?? "0") === "1"
  const productLimit = clampInt(q.productLimit, 24, 1, 200)

  // ✅ NUEVO
  const includeChildren = String(q.includeChildren ?? "0") === "1"
  const childLimit = clampInt(q.childLimit, 24, 1, 200)

  const { categories, products } = await getCmsCatalog()

  let category =
    (categories || []).find((c: any) => normalizePath(c?.path) === wantedPath) ||
    (categories || []).find((c: any) => {
      const cSlug = normalizeSlug(c?.slug)
      const legacySlugs = Array.isArray(c?.legacySlugs) ? c.legacySlugs.map(normalizeSlug) : []
      const slugs = Array.isArray(c?.slugs) ? c.slugs.map(normalizeSlug) : []
      return cSlug === wantedSlug || legacySlugs.includes(wantedSlug) || slugs.includes(wantedSlug)
    })

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: "Categoría no encontrada" })
  }

  const canonicalPath = normalizePath(category?.path)
  const redirectTo = wantedPath !== canonicalPath ? canonicalPath : undefined

  const tabs =
    Array.isArray(category?.tabs) && category.tabs.length
      ? category.tabs
      : normalizeTabs(parseTabsJson(category?.TabsJson ?? category?.tabsJson ?? ""))

  const ogImageSrc = category?.seo?.ogImageSrc || category?.image?.src || null

  // ✅ Productos (solo si se pide)
  let categoryProducts: any[] = []
  if (includeProducts) {
    const slugKey = normalizeSlug(category?.slug)
    categoryProducts = (products || [])
      .filter((p: any) => normalizeSlug(p?.categorySlug) === slugKey)
      .slice(0, productLimit)
  }

  // ✅ NUEVO: children (subcategorías directas)
  let children: any[] = []
  if (includeChildren) {
    const parentSlugKey = normalizeSlug(category?.slug)
    const parentPath = canonicalPath
    const parentDepth = stripCategoriasPrefix(parentPath).split("/").filter(Boolean).length

    children = (categories || [])
      .filter((c: any) => {
        if (!c) return false
        const cPath = normalizePath(c?.path)
        if (!cPath.startsWith(parentPath + "/")) return false

        // direct child = profundidad + 1
        const cDepth = stripCategoriasPrefix(cPath).split("/").filter(Boolean).length
        if (cDepth !== parentDepth + 1) return false

        // si la columna parent existe, la validamos
        const cParent = normalizeSlug(c?.parent)
        if (cParent && cParent !== parentSlugKey) return false

        return true
      })
      .sort((a: any, b: any) => (Number(a?.order || 0) - Number(b?.order || 0)))
      .slice(0, childLimit)
      .map((c: any) => ({
        // devuelve solo lo necesario para pintar cards
        slug: c.slug,
        path: normalizePath(c.path),
        title: c.title ?? "",
        nav: c.nav ?? "",
        description: c.description ?? "",
        imageSrc: c.imageSrc || c.image?.src || null,
        alt: c.alt || c.title || c.nav || "Subcategoría",
        order: Number(c.order ?? 0) || 0,
      }))
  }

  return {
    ...category,
    tabs,
    ...(includeProducts ? { products: categoryProducts } : {}),
    ...(includeChildren ? { children } : {}), // ✅
    seo: {
      ...(category?.seo || {}),
      robots: computeRobots(category),
      ogImageSrc,
    },
    ...(redirectTo ? { redirectTo } : {}),
  }
})
