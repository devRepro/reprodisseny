import { defineEventHandler, getQuery } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const s = (v: any) => String(v ?? "").trim()
const norm = (v: any) => s(v).toLowerCase()

const imgSrc = (x: any) => (typeof x === "string" ? x : x?.src) || null

export default defineEventHandler(async (event) => {
  const q = getQuery(event)

  const limit = Math.max(0, Math.min(200, Number(q.limit ?? 0))) // 0 = sin límite
  const category = s(q.category) // slug de categoría
  const featuredOnly = String(q.featured ?? "") === "1" || String(q.featured ?? "") === "true"
  const search = norm(q.q)
  const sort = s(q.sort) || "order" // order | title | newest (si tienes campo)
  const dir = (s(q.dir) || "asc").toLowerCase() === "desc" ? "desc" : "asc"

  const { products } = await getCmsCatalog()

  // 1) Filtra publicados + visibles
  let rows = (products || []).filter((p: any) => p?.isPublished !== false && p?.hidden !== true)

  // 2) Filtra por categoría (si tu producto tiene categorySlug o categories[])
  if (category) {
    rows = rows.filter((p: any) => {
      const single = norm(p.categorySlug)
      const multi = Array.isArray(p.categories) ? p.categories.map(norm) : []
      return single === norm(category) || multi.includes(norm(category))
    })
  }

  // 3) Featured
  if (featuredOnly) {
    rows = rows.filter((p: any) => !!(p.featured ?? p.isFeatured ?? p.IsFeatured))
  }

  // 4) Búsqueda simple (title/shortDescription/body)
  if (search) {
    rows = rows.filter((p: any) => {
      const hay = [
        p.title,
        p.shortDescription,
        p.description,
        p.bodyMd,
      ]
        .map(norm)
        .join(" | ")
      return hay.includes(search)
    })
  }

  // 5) Ordenación
  const byOrder = (p: any) => n(p.order ?? p.sortOrder ?? p.SortOrder)
  const byTitle = (p: any) => norm(p.title)
  const byNewest = (p: any) => {
    // si tienes campos tipo updatedAt/publishedAt/date, ajusta aquí
    return Date.parse(p.updatedAt ?? p.publishedAt ?? p.date ?? "") || 0
  }

  rows = rows.slice().sort((a: any, b: any) => {
    let aa = 0 as any
    let bb = 0 as any

    if (sort === "title") {
      aa = byTitle(a); bb = byTitle(b)
      return aa.localeCompare(bb)
    }

    if (sort === "newest") {
      aa = byNewest(a); bb = byNewest(b)
      return aa - bb
    }

    // default: order (y fallback title)
    aa = byOrder(a); bb = byOrder(b)
    const d1 = aa - bb
    if (d1 !== 0) return d1
    return byTitle(a).localeCompare(byTitle(b))
  })

  if (dir === "desc") rows.reverse()

  // 6) Límite
  if (limit > 0) rows = rows.slice(0, limit)

  // 7) Normaliza el shape de salida
  return rows.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    path: p.path || (p.slug ? `/productos/${p.slug}` : "/productos"),
    title: p.title,
    categorySlug: p.categorySlug ?? null,
    shortDescription: p.shortDescription ?? "",
    image: imgSrc(p.image)
      ? {
          src: imgSrc(p.image),
          alt: p.image?.alt ?? p.title ?? "",
          width: p.image?.width ?? 1200,
          height: p.image?.height ?? 1200,
        }
      : null,
    featured: !!(p.featured ?? p.isFeatured ?? p.IsFeatured),
    order: byOrder(p),
  }))
})
