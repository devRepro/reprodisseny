// server/api/home/categorias.get.ts
import { defineEventHandler, getQuery } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

type AnyObj = Record<string, any>

function qInt(q: AnyObj, key: string, def: number, min: number, max: number) {
  const n = parseInt(String(q?.[key] ?? ""), 10)
  if (!Number.isFinite(n)) return def
  return Math.max(min, Math.min(max, n))
}

function normPath(v: unknown) {
  let s = String(v ?? "").trim()
  if (!s) return ""
  if (!s.startsWith("/")) s = "/" + s
  s = s.replace(/\/{2,}/g, "/")
  return s.replace(/\/+$/, "")
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

function stripCategorias(path: string) {
  return String(path || "")
    .replace(/^\/+/, "/")
    .replace(/^\/categorias\//i, "")
    .replace(/\/+$/, "")
}

function pathDepth(path: string) {
  return stripCategorias(path).split("/").filter(Boolean).length
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as AnyObj
  const limit = qInt(q, "limit", 8, 1, 24)

  const catalog = await getCmsCatalog()
  const categories = Array.isArray(catalog?.categories) ? catalog.categories : []

  // Home: categorías principales publicadas
  const items = categories
    .filter((c: AnyObj) => {
      const path = normPath(c?.path)
      if (!path.startsWith("/categorias/")) return false
      if (pathDepth(path) !== 1) return false
      if (c?.hidden === true) return false
      if (c?.isPublished === false) return false
      return true
    })
    .sort(
      (a: AnyObj, b: AnyObj) =>
        Number(a?.order ?? a?.SortOrder ?? 0) - Number(b?.order ?? b?.SortOrder ?? 0)
    )
    .slice(0, limit)
    .map((c: AnyObj, index: number) => ({
      id: c?.id ?? c?.slug ?? `cat-${index}`,
      slug: c?.slug ?? c?.categorySlug ?? "",
      path: normPath(c?.path),
      href: normPath(c?.path),
      title: c?.title ?? c?.Title ?? c?.nav ?? c?.NavLabel ?? "",
      description: c?.description ?? c?.Description ?? "",
      imageSrc: normAssetSrc(c?.imageSrc || c?.ImageSrc || c?.image?.src),
      alt:
        c?.alt ||
        c?.ImageAlt ||
        c?.title ||
        c?.Title ||
        c?.nav ||
        c?.NavLabel ||
        "Categoría",
    }))

  console.log("[home/categorias] total catalog categories =", categories.length)
  console.log("[home/categorias] response =", items)

  return items
})