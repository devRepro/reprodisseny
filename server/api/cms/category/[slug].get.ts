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

  // ✅ path completo del request: /categorias/a/b/c
  const wantedPath = normalizePath("/categorias/" + slugParts.join("/"))

  // ✅ último segmento, por si hay legacy slugs
  const wantedSlug = normalizeSlug(slugParts[slugParts.length - 1] || "")

  const q = getQuery(event) as any
  const includeProducts = String(q.includeProducts ?? "0") === "1"
  const productLimit = clampInt(q.productLimit, 24, 1, 200)

  const { categories, products } = await getCmsCatalog()

  // ✅ Encuentra primero por PATH EXACTO (evita colisiones en subcategorías)
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

  // ✅ redirect canónico si entraste por alias o path no canónico
  const canonicalPath = normalizePath(category?.path)
  const redirectTo = wantedPath !== canonicalPath ? canonicalPath : undefined

  // ✅ Tabs: si ya viene array => úsalo; si no => parsea TabsJson/tabsJson
  const tabs =
    Array.isArray(category?.tabs) && category.tabs.length
      ? category.tabs
      : normalizeTabs(parseTabsJson(category?.TabsJson ?? category?.tabsJson ?? ""))

  // ✅ og image (override si existe)
  const ogImageSrc = category?.seo?.ogImageSrc || category?.image?.src || null

  // ✅ Productos (solo si se pide)
  let categoryProducts: any[] = []
  if (includeProducts) {
    const slugKey = normalizeSlug(category?.slug)

    categoryProducts = (products || [])
      .filter((p: any) => normalizeSlug(p?.categorySlug) === slugKey)
      .slice(0, productLimit)
  }

  return {
    ...category,
    tabs,
    ...(includeProducts ? { products: categoryProducts } : {}),
    seo: {
      ...(category?.seo || {}),
      robots: computeRobots(category),
      ogImageSrc,
    },
    ...(redirectTo ? { redirectTo } : {}),
  }
})
