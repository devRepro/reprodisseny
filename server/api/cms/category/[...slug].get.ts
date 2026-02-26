// server/api/cms/category/[...slug].get.ts
import { defineEventHandler, getQuery, getRouterParam, createError } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

type AnyObj = Record<string, any>

/* -----------------------------
   Normalización
------------------------------ */

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

function stripCategorias(path: string) {
  return String(path || "")
    .replace(/^\/+/, "/")
    .replace(/^\/categorias\//i, "")
    .replace(/\/+$/, "")
}

/* -----------------------------
   Query helpers
------------------------------ */

function qBool(q: AnyObj, key: string, def = false) {
  const v = q?.[key]
  if (v === undefined || v === null) return def
  return String(v) === "1" || String(v).toLowerCase() === "true"
}

function qInt(q: AnyObj, key: string, def: number, min: number, max: number) {
  const n = parseInt(String(q?.[key] ?? ""), 10)
  if (!Number.isFinite(n)) return def
  return Math.max(min, Math.min(max, n))
}

/* -----------------------------
   SEO helpers
------------------------------ */

function computeRobots(c: AnyObj) {
  if (c?.hidden) return "noindex,follow"

  const override = String(c?.seo?.robotsOverride ?? c?.RobotsOverride ?? "INHERIT")
    .toUpperCase()
    .trim()

  const base =
    override === "NOINDEX_FOLLOW"
      ? "noindex,follow"
      : override === "NOINDEX_NOFOLLOW"
        ? "noindex,nofollow"
        : override === "INDEX_NOFOLLOW"
          ? "index,nofollow"
          : "index,follow"

  const adv = String(c?.seo?.robotsAdvanced ?? c?.RobotsAdvanced ?? "").trim()
  return adv ? `${base},${adv}` : base
}

/* -----------------------------
   Resolvers
------------------------------ */

function resolveProducts(products: AnyObj[], categorySlug: string, limit: number) {
  const slugKey = normSlug(categorySlug)
  if (!slugKey) return []
  return (products || [])
    .filter((p) => normSlug(p?.categorySlug) === slugKey)
    .slice(0, limit)
}

function resolveChildren(categories: AnyObj[], parent: AnyObj, canonicalParentPath: string, limit: number) {
  const parentSlugKey = normSlug(parent?.slug)
  const parentDepth = stripCategorias(canonicalParentPath).split("/").filter(Boolean).length

  return (categories || [])
    .filter((c) => {
      if (!c) return false
      const cPath = normPath(c?.path)
      if (!cPath.startsWith(canonicalParentPath + "/")) return false

      const cDepth = stripCategorias(cPath).split("/").filter(Boolean).length
      if (cDepth !== parentDepth + 1) return false

      const cParent = normSlug(c?.parent)
      if (cParent && parentSlugKey && cParent !== parentSlugKey) return false

      return true
    })
    .sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
    .slice(0, limit)
    .map((c) => ({
      slug: c.slug,
      path: normPath(c.path),
      title: c.title ?? c.Title ?? "",
      nav: c.nav ?? c.NavLabel ?? "",
      description: c.description ?? c.Description ?? "",
      imageSrc: c.imageSrc || c.ImageSrc || c.image?.src || null,
      alt: c.alt || c.ImageAlt || c.title || c.nav || "Subcategoría",
      order: Number(c.order ?? c.SortOrder ?? 0) || 0,
    }))
}

/* -----------------------------
   Handler
------------------------------ */

export default defineEventHandler(async (event) => {
  const raw = getRouterParam(event, "slug") || ""
  const slugParts = String(raw).split("/").filter(Boolean)

  const wantedPath = normPath("/categorias/" + slugParts.join("/"))
  const wantedSlug = normSlug(slugParts.at(-1) || "")

  const q = getQuery(event) as AnyObj
  const includeProducts = qBool(q, "includeProducts", false)
  const productLimit = qInt(q, "productLimit", 24, 1, 200)

  const includeChildren = qBool(q, "includeChildren", false)
  const childLimit = qInt(q, "childLimit", 24, 1, 200)

  const catalog = await getCmsCatalog()
  const categories = catalog.categories || []
  const products = catalog.products || []

  // lookup rápido (por índice) + fallback por si un día no existe
  const idx = (catalog as any).__index
  const byPath = idx?.byPath as Map<string, any> | undefined
  const bySlug = idx?.bySlug as Map<string, any> | undefined

  const category =
    byPath?.get(wantedPath) ||
    bySlug?.get(wantedSlug) ||
    categories.find((c) => normPath(c?.path) === wantedPath) ||
    categories.find((c) => normSlug(c?.slug) === wantedSlug)

  if (!category) throw createError({ statusCode: 404, statusMessage: "Categoría no encontrada" })

  const canonicalPath = normPath(category?.path)
  const redirectTo = wantedPath !== canonicalPath ? canonicalPath : undefined

  const ogImageSrc =
    category?.seo?.ogImageSrc || category?.OgImageSrc || category?.image?.src || category?.ImageSrc || null

  const outProducts = includeProducts ? resolveProducts(products, category?.slug, productLimit) : undefined
  const outChildren = includeChildren ? resolveChildren(categories, category, canonicalPath, childLimit) : undefined

  return {
    ...category,
    // tabs ya hidratados en getCmsCatalog()
    tabs: Array.isArray(category?.tabs) ? category.tabs : [],
    ...(outProducts ? { products: outProducts } : {}),
    ...(outChildren ? { children: outChildren } : {}),
    seo: {
      ...(category?.seo || {}),
      robots: computeRobots(category),
      ogImageSrc,
    },
    ...(redirectTo ? { redirectTo } : {}),
  }
})