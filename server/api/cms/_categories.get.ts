import { defineEventHandler } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const imgSrc = (x: any) => (typeof x === "string" ? x : x?.src) || null

export default defineEventHandler(async () => {
  const { categories } = await getCmsCatalog()

  const rows = (categories || [])
    .filter((c: any) => c?.isPublished !== false && c?.hidden !== true)
    .slice()
    .sort(
      (a: any, b: any) =>
        n(a.order ?? a.sortOrder ?? a.SortOrder) - n(b.order ?? b.sortOrder ?? b.SortOrder)
    )

  return rows.map((c: any) => ({
    id: c.id,
    slug: c.slug,
    path: c.path || (c.slug ? `/categorias/${c.slug}` : "/categorias"),
    title: c.title,
    nav: c.nav ?? c.title,
    description: c.description ?? "",
    image: imgSrc(c.image)
      ? {
          src: imgSrc(c.image),
          alt: c.image?.alt ?? c.title ?? "",
          width: c.image?.width ?? 1200,
          height: c.image?.height ?? 800,
        }
      : null,
    featured: !!(c.featured ?? c.isFeatured ?? c.IsFeatured),
    order: n(c.order ?? c.sortOrder ?? c.SortOrder),
  }))
})
