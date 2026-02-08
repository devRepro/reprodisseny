// server/api/cms/product/[slug].get.ts
import { defineEventHandler, getRouterParam, getQuery, createError } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const s = (v: any) => String(v ?? "").trim()
const norm = (v: any) => s(v).toLowerCase()

const imgSrc = (x: any) => (typeof x === "string" ? x : x?.src) || null

function normalizeProductSlug(raw: any) {
  let out = s(raw)
  out = out.split("?")[0]
  out = out.replace(/^\/+/, "")
  out = out.replace(/^productos\//i, "")
  out = out.replace(/^\/?productos\//i, "")
  out = out.replace(/^\/+|\/+$/g, "")
  // si llega algo tipo "foo/bar", nos quedamos con el último segmento
  if (out.includes("/")) out = out.split("/").filter(Boolean).pop() || out
  return out
}

function normalizeProduct(p: any) {
  const src = imgSrc(p.image)
  return {
    ...p,
    path: p.path || (p.slug ? `/productos/${p.slug}` : "/productos"),
    image: src
      ? {
          src,
          alt: p.image?.alt ?? p.title ?? "",
          width: p.image?.width ?? 1200,
          height: p.image?.height ?? 1200,
        }
      : null,
    order: n(p.order ?? p.sortOrder ?? p.SortOrder),
    featured: !!(p.featured ?? p.isFeatured ?? p.IsFeatured),
  }
}

function normalizeRelatedItem(p: any) {
  const x = normalizeProduct(p)
  return {
    id: x.id,
    slug: x.slug,
    path: x.path,
    title: x.title,
    image: x.image,
    order: x.order,
  }
}

export default defineEventHandler(async (event) => {
  const slugParam = getRouterParam(event, "slug")
  const slug = normalizeProductSlug(slugParam)

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Falta slug" })
  }

  const q = getQuery(event)
  const relatedLimit = Math.max(0, Math.min(12, Number(q.relatedLimit ?? 4)))
  const includeRelated = String(q.includeRelated ?? "1") !== "0"
  const includeCategory = String(q.includeCategory ?? "1") !== "0"

  const { products, categories } = await getCmsCatalog()

  const rows = (products || []).filter((p: any) => p?.isPublished !== false && p?.hidden !== true)

  // match por slug (principal) + fallback por path
  const found =
    rows.find((p: any) => norm(p.slug) === norm(slug)) ||
    rows.find((p: any) => {
      const pathLast = normalizeProductSlug(p.path)
      return norm(pathLast) === norm(slug)
    })

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" })
  }

  const product = normalizeProduct(found)

  const category = includeCategory
    ? (categories || []).find((c: any) => norm(c?.slug) === norm(product.categorySlug))
    : null

  // Tabs/FAQs: si el producto no tiene, fallback a categoría (tu catalog.json suele tenerlo en categoría)
  const detailsTabs = (product as any)?.tabs?.length ? (product as any).tabs : (category as any)?.tabs || []
  const faqs = (product as any)?.faqs?.length ? (product as any).faqs : (category as any)?.faqs || []

  // Related: mismo categorySlug, excluyendo el actual
  let related: any[] = []
  if (includeRelated && relatedLimit > 0) {
    related = rows
      .filter((p: any) => norm(p?.categorySlug) === norm(product.categorySlug) && norm(p?.slug) !== norm(product.slug))
      .slice()
      .sort((a: any, b: any) => {
        const d = n(a.order ?? a.sortOrder ?? a.SortOrder) - n(b.order ?? b.sortOrder ?? b.SortOrder)
        if (d !== 0) return d
        return norm(a.title).localeCompare(norm(b.title))
      })
      .slice(0, relatedLimit)
      .map(normalizeRelatedItem)
  }

  // Breadcrumbs: usa los de categoría si existen, y añade producto al final
  const breadcrumbs = Array.isArray((category as any)?.breadcrumbs) && (category as any).breadcrumbs.length
    ? [
        ...(category as any).breadcrumbs.map((b: any) => ({ name: b?.name, url: b?.url })),
        { name: product.title, url: product.path },
      ]
    : [
        { name: "Inicio", url: "/" },
        ...(category
          ? [{ name: (category as any).title || (category as any).slug, url: (category as any).path || `/categorias/${(category as any).slug}` }]
          : []),
        { name: product.title, url: product.path },
      ]

  return {
    product,
    category: category ? { ...category } : null,
    detailsTabs,
    faqs,
    related,
    breadcrumbs,
  }
})
