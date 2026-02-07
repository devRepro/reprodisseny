import { defineEventHandler, getQuery } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const norm = (s: any) => String(s || "").trim().toLowerCase()

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const mode = String(q.mode ?? "nav") // nav | catalog
  const productLimit =
    mode === "catalog"
      ? Math.max(0, Math.min(50, Number(q.productLimit ?? 6)))
      : 0

  const { categories, products } = await getCmsCatalog()

  const cats = (categories || [])
    .filter((c: any) => c?.isPublished !== false && c?.hidden !== true)
    .filter((c: any) => c?.showInNav !== false) // ✅ control mega menú
    .slice()
    .sort((a: any, b: any) => n(a.order ?? a.sortOrder ?? a.SortOrder) - n(b.order ?? b.sortOrder ?? b.SortOrder))

  const prods =
    mode === "catalog"
      ? (products || [])
          .filter((p: any) => p?.isPublished !== false && p?.hidden !== true)
          .slice()
          .sort((a: any, b: any) => n(a.order ?? a.sortOrder ?? a.SortOrder) - n(b.order ?? b.sortOrder ?? b.SortOrder))
      : []

  // 1) nodos categoría
  const bySlug: Record<string, any> = {}
  for (const c of cats) {
    const slug = norm(c.slug)
    if (!slug) continue
    bySlug[slug] = {
      id: c.id,
      slug: c.slug,
      title: c.title,
      nav: (c.navTitle ?? c.nav ?? c.title) || c.title,
      order: n(c.navOrder ?? c.order ?? c.sortOrder ?? c.SortOrder),
      path: c.path || `/categorias/${c.slug}`, // ✅ unifica ruta
      image: (typeof c.image === "string" ? c.image : c.image?.src) || undefined,
      parent: norm(c.parent || c.parentSlug || c.ParentSlug) || undefined,
      children: [],
      products: [],
    }
  }

  // 2) árbol por parent
  const roots: any[] = []
  for (const s in bySlug) {
    const node = bySlug[s]
    if (node.parent && bySlug[node.parent]) bySlug[node.parent].children.push(node)
    else roots.push(node)
  }

  // 3) productos agrupados por categorySlug (solo modo catalog)
  if (mode === "catalog" && productLimit > 0) {
    const byCat: Record<string, any[]> = {}
    for (const p of prods) {
      const cs = norm(p.categorySlug ?? p.CategorySlug)
      if (!cs) continue
      ;(byCat[cs] ||= []).push({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.shortDescription ?? p.description ?? "",
        image: (typeof p.image === "string" ? p.image : p.image?.src) || undefined,
        categorySlug: p.categorySlug ?? p.CategorySlug,
        path: p.path || `/productos∫/${p.slug}`, // ✅ unifica (elige tu ruta real)
        order: n(p.order ?? p.sortOrder ?? p.SortOrder),
        price: n(p.price ?? p.Price),
      })
    }

    const attach = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.children?.length) attach(node.children)
        else node.products = byCat[norm(node.slug)]?.slice(0, productLimit) ?? []
      }
    }
    attach(roots)
  }

  // 4) índice por slug
  const indexBySlug: Record<string, any> = {}
  const walk = (nodes: any[]) => {
    for (const node of nodes) {
      indexBySlug[norm(node.slug)] = node
      if (node.children?.length) walk(node.children)
    }
  }
  walk(roots)

  // ✅ para mega menú: tree (roots) ya es el menú
  return { tree: roots, indexBySlug }
})
