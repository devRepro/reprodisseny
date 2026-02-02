// server/api/cms/category/[...slug].get.ts
import { defineEventHandler, getRouterParam, createError } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"
import { parseTabsJson, normalizeTabs } from "~/utils/tabsJson" // <- el helper que ya te pasé antes

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

export default defineEventHandler(async (event) => {
  const raw = getRouterParam(event, "slug") || ""
  const slugParts = String(raw).split("/").filter(Boolean)
  const wantedPath = normalizePath("/categorias/" + slugParts.join("/"))
  const wantedSlug = normalizeSlug(slugParts[slugParts.length - 1] || "")

  const { categories, products } = await getCmsCatalog()

  const category = (categories || []).find((c: any) => {
    const cPath = normalizePath(c?.path)
    const cSlug = normalizeSlug(c?.slug)
    const slugs = Array.isArray(c?.slugs) ? c.slugs.map(normalizeSlug) : []
    return cPath === wantedPath || cSlug === wantedSlug || slugs.includes(wantedSlug)
  })

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: "Categoría no encontrada" })
  }

  // ✅ redirect canónico si entraste por alias (SEO)
  const canonicalPath = normalizePath(category?.path)
  const redirectTo = wantedPath !== canonicalPath ? canonicalPath : null

  // ✅ TabsJson -> tabs (blocks)
  const tabs = normalizeTabs(parseTabsJson(category?.TabsJson))

  // ✅ og image (override si existe)
  const ogImageSrc = category?.seo?.ogImageSrc || category?.image?.src || null

  // Productos de la categoría
  const slugKey = normalizeSlug(category?.slug)
  const categoryProducts = (products || []).filter((p: any) => normalizeSlug(p?.categorySlug) === slugKey)

  return {
    ...category,
    tabs,
    products: categoryProducts,
    seo: {
      ...(category?.seo || {}),
      robots: computeRobots(category),
      ogImageSrc,
    },
    redirectTo,
  }
})
