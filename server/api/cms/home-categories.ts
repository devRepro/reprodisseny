import { defineEventHandler } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const src = (x: any) => (typeof x === "string" ? x : x?.src) || null

export default defineEventHandler(async () => {
  const { categories } = await getCmsCatalog()

  const rows = (categories || [])
    .filter((c: any) => c?.isPublished !== false && c?.hidden !== true)
    // ✅ SOLO primer nivel (ajusta según tu modelo)
    .filter((c: any) => !c.parent && c.type !== "subcategoria")
    // ✅ si quieres solo destacadas:
    // .filter((c: any) => !!(c.featured ?? c.isFeatured ?? c.IsFeatured))
    .slice()
    .sort((a: any, b: any) => n(a.order ?? a.sortOrder ?? a.SortOrder) - n(b.order ?? b.sortOrder ?? b.SortOrder))
    .slice(0, 8)

  return rows.map((c: any) => ({
    slug: c.slug,
    title: c.nav ?? c.title,
    path: c.path || (c.slug ? `/categorias/${c.slug}` : "/categorias"),
    image: src(c.image), // ✅ string directo para la card
  }))
})
