// server/api/cms/catalog.get.ts
import { getQuery, setHeader } from "h3"
import { defineCachedEventHandler } from "nitropack/runtime"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const norm = (s: any) => String(s || "").trim().toLowerCase()

export default defineCachedEventHandler(
  async (event) => {
    const q = getQuery(event)

    const mode = String(q.mode ?? "nav") // nav | catalog
    const includeProducts = q.includeProducts === "1" || q.includeProducts === "true"

    const requestedLimit = Math.max(0, Math.min(50, Number(q.productLimit ?? 6)))

    // ✅ nav: solo adjunta productos si includeProducts=1
    // ✅ catalog: adjunta productos siempre
    const productLimit =
      mode === "catalog" ? requestedLimit : includeProducts ? requestedLimit : 0

    // (Opcional) cache para CDN/proxy
    setHeader(
      event,
      "Cache-Control",
      "public, max-age=0, s-maxage=300, stale-while-revalidate=3600"
    )

    const { categories, products } = await getCmsCatalog()

    const cats = (categories || [])
      .filter((c: any) => c?.isPublished !== false && c?.hidden !== true)
      .filter((c: any) => c?.showInNav !== false)
      .slice()
      .sort(
        (a: any, b: any) =>
          n(a.order ?? a.sortOrder ?? a.SortOrder) -
          n(b.order ?? b.sortOrder ?? b.SortOrder)
      )

    const prods =
      productLimit > 0
        ? (products || [])
            .filter((p: any) => p?.isPublished !== false && p?.hidden !== true)
            .slice()
            .sort(
              (a: any, b: any) =>
                n(a.order ?? a.sortOrder ?? a.SortOrder) -
                n(b.order ?? b.sortOrder ?? b.SortOrder)
            )
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
        path: c.path || `/categorias/${c.slug}`,
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

    // ✅ orden recursivo (roots + children)
    const sortTree = (nodes: any[]) => {
      nodes.sort((a, b) => n(a.order) - n(b.order))
      for (const node of nodes) if (node.children?.length) sortTree(node.children)
    }
    sortTree(roots)

    // 3) productos agrupados por categorySlug (solo si productLimit > 0)
    if (productLimit > 0) {
      const byCat: Record<string, any[]> = {}
      for (const p of prods) {
        const cs = norm(p.categorySlug ?? p.CategorySlug)
        if (!cs) continue
        ;(byCat[cs] ||= []).push({
          id: p.id,
          slug: p.slug,
          title: p.title,
          image: (typeof p.image === "string" ? p.image : p.image?.src) || undefined,
          path: p.path || `/productos/${p.slug}`, // ✅ FIX
          order: n(p.order ?? p.sortOrder ?? p.SortOrder),
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

    return {
      tree: roots,
      indexBySlug,
      menuItems: roots, // ✅ compat con tu tipo
    }
  },
  {
    maxAge: 60 * 5,
    swr: true,
    getKey: (event) => {
      const q = getQuery(event)
      const mode = String(q.mode ?? "nav")
      const includeProducts = q.includeProducts === "1" || q.includeProducts === "true"
      const productLimit = String(q.productLimit ?? "")
      return `cmsCatalog:${mode}:ip${includeProducts ? 1 : 0}:pl${productLimit}`
    },
    shouldInvalidateCache: (event) => getQuery(event).refresh === "1",
  }
)

