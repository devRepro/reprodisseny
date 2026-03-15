// server/api/cms/category/[...slug].get.ts
import { defineEventHandler, getQuery, getRouterParam, createError } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"
import { resolveCategoryRoute } from "~/server/utils/cmsCategoryRouting.server"

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

function normAssetSrc(v: unknown) {
  let s = String(v ?? "").trim()
  if (!s) return null

  if (/^(https?:)?\/\//i.test(s) || s.startsWith("data:") || s.startsWith("blob:")) {
    return s
  }

  s = s.replace(/\\/g, "/")
  s = s.replace(/^\.?\//, "")
  s = s.replace(/^\/+/, "")

  return "/" + s
}

function isAssetLike(v: unknown) {
  const s = String(v ?? "").trim()
  return /^(img|_nuxt)\//i.test(s) || /\.(jpg|jpeg|png|webp|avif|gif|svg|pdf)$/i.test(s)
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
    .filter((p) => {
      const productCategorySlug = normSlug(
        p?.categorySlug || p?.CategorySlug || p?.category?.slug || p?.category
      )
      return productCategorySlug === slugKey
    })
    .slice(0, limit)
}

function resolveChildren(
  categories: AnyObj[],
  parent: AnyObj,
  canonicalParentPath: string,
  limit: number
) {
  const parentSlugKey = normSlug(parent?.slug || parent?.categorySlug)
  const parentDepth = stripCategorias(canonicalParentPath).split("/").filter(Boolean).length

  return (categories || [])
    .filter((c) => {
      if (!c) return false

      const cPath = normPath(c?.path)
      if (!cPath.startsWith(canonicalParentPath + "/")) return false

      const cDepth = stripCategorias(cPath).split("/").filter(Boolean).length
      if (cDepth !== parentDepth + 1) return false

      const cParent = normSlug(c?.parent || c?.parentSlug || c?.Parent)
      if (cParent && parentSlugKey && cParent !== parentSlugKey) return false

      return true
    })
    .sort((a, b) => Number(a?.order ?? a?.SortOrder ?? 0) - Number(b?.order ?? b?.SortOrder ?? 0))
    .slice(0, limit)
    .map((c) => ({
      slug: c.slug || c.categorySlug || "",
      path: normPath(c.path),
      title: c.title ?? c.Title ?? "",
      nav: c.nav ?? c.NavLabel ?? "",
      description: c.description ?? c.Description ?? "",
      imageSrc: normAssetSrc(c.imageSrc || c.ImageSrc || c.image?.src),
      alt: c.alt || c.ImageAlt || c.title || c.nav || "Subcategoría",
      order: Number(c.order ?? c.SortOrder ?? 0) || 0,
    }))
}

/* -----------------------------
   Handler
------------------------------ */

export default defineEventHandler(async (event) => {
  function splitSlugParts(v: unknown) {
    return String(v ?? "")
      .trim()
      .replace(/^\/+|\/+$/g, "")
      .split(/[\/,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const raw = getRouterParam(event, "slug") || ""

  if (isAssetLike(raw)) {
    throw createError({
      statusCode: 404,
      message: `Ruta de asset capturada por /api/cms/category: ${raw}`,
    })
  }

  const slugParts = splitSlugParts(raw)
  const requested = "/categorias/" + slugParts.join("/")

  const q = getQuery(event) as AnyObj
  const includeProducts = qBool(q, "includeProducts", false)
  const productLimit = qInt(q, "productLimit", 24, 1, 200)

  const includeChildren = qBool(q, "includeChildren", false)
  const childLimit = qInt(q, "childLimit", 24, 1, 200)

  const catalog = await getCmsCatalog()
  const categories = catalog.categories || []
  const products = catalog.products || []

  const idx = (catalog as any).__index
  const byPath = idx?.byPath as Map<string, any> | undefined
  const bySlug = idx?.bySlug as Map<string, any> | undefined

  const resolved = resolveCategoryRoute(categories, byPath, bySlug, requested)

  if (!resolved?.category) {
    throw createError({
      statusCode: 404,
      message: `Categoría no encontrada: ${requested}`,
    })
  }

  const category = resolved.category
  const canonicalPath = normPath(resolved.canonicalPath || category?.path)
  const redirectTo = resolved.redirectTo ? normPath(resolved.redirectTo) : undefined

  const categorySlug = normSlug(category?.slug || category?.categorySlug)

  const normalizedImageSrc = normAssetSrc(
    category?.imageSrc || category?.ImageSrc || category?.image?.src
  )

  const ogImageSrc = normAssetSrc(
    category?.seo?.ogImageSrc ||
      category?.OgImageSrc ||
      category?.image?.src ||
      category?.ImageSrc
  )

  const outProducts = includeProducts
    ? resolveProducts(products, categorySlug, productLimit)
    : undefined

  const outChildren = includeChildren
    ? resolveChildren(categories, category, canonicalPath, childLimit)
    : undefined

  return {
    ...category,
    slug: categorySlug,
    path: canonicalPath,
    imageSrc: normalizedImageSrc,
    image: category?.image
      ? {
          ...category.image,
          src: normAssetSrc(category.image.src),
        }
      : category?.image,
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