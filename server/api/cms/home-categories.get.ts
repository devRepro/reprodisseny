import { defineEventHandler, getQuery } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const s = (v: any) => String(v ?? "").trim()
const imgSrc = (x: any) => (typeof x === "string" ? x : x?.src) || null

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const limit = Math.max(0, Math.min(24, Number(q.limit ?? 8)))

  const { categories } = await getCmsCatalog()

  const rows = (categories || [])
    .filter((c: any) => c?.isPublished !== false && c?.hidden !== true)
    // ✅ primer nivel: sin parent (soporta variantes típicas)
    .filter((c: any) => !s(c.parent ?? c.parentSlug ?? c.Parent ?? c.ParentSlug))
    .slice()
    .sort(
      (a: any, b: any) =>
        n(a.order ?? a.sortOrder ?? a.SortOrder) -
        n(b.order ?? b.sortOrder ?? b.SortOrder)
    )
    .slice(0, limit)

  return rows.map((c: any) => ({
    id: c.id,
    slug: c.slug,
    path: c.path || (c.slug ? `/categorias/${c.slug}` : "/categorias"),
    title: c.nav ?? c.title,
    image: imgSrc(c.image)
      ? {
          src: imgSrc(c.image),
          alt: c.image?.alt ?? c.nav ?? c.title ?? "",
          width: c.image?.width ?? 2400,
          height: c.image?.height ?? 1200,
        }
      : null,
    order: n(c.order ?? c.sortOrder ?? c.SortOrder),
  }))
})
