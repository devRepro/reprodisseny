import { getQuery, setHeader } from "h3"
import { defineCachedEventHandler } from "nitropack/runtime"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const norm = (s: any) => String(s || "").trim().toLowerCase()

function getProductCategorySlugs(p: any): string[] {
  const primary = norm(p.categorySlug ?? p.CategorySlug)

  let secondary: string[] = []

  const raw = p.categories ?? p.Categories

  if (Array.isArray(raw)) {
    secondary = raw.map(norm).filter(Boolean)
  } else if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        secondary = parsed.map(norm).filter(Boolean)
      }
    } catch {
      secondary = raw
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .replace(/"/g, "")
        .replace(/'/g, "")
        .split(/[;,]/)
        .map((v) => norm(v))
        .filter(Boolean)
    }
  }

  return [...new Set([primary, ...secondary].filter(Boolean))]
}

export default defineCachedEventHandler(
  async (event) => {
    const q = getQuery(event)

    const mode = String(q.mode ?? "nav") // nav | catalog
    const includeProducts = q.includeProducts === "1" || q.includeProducts === "true"
    const requestedLimit = Math.max(0, Math.min(500, Number(q.productLimit ?? 24)))

    const productLimit =
      mode === "catalog"
        ? requestedLimit || 500
        : includeProducts
        ? requestedLimit || 6
        : 0

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

    const prods = (products || [])
      .filter((p: any) => p?.isPublished !== false && p?.hidden !== true)
      .slice()
      .sort(
        (a: any, b: any) =>
          n(a.order ?? a.sortOrder ?? a.SortOrder) -
          n(b.order ?? b.sortOrder ?? b.SortOrder)
      )

    // 1) categorías planas para catálogo
    const flatCategories = cats.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      nav: (c.navTitle ?? c.nav ?? c.title) || c.title,
      label: (c.navTitle ?? c.nav ?? c.title) || c.title,
      order: n(c.navOrder ?? c.order ?? c.sortOrder ?? c.SortOrder),
      path: c.path || `/categorias/${c.slug}`,
      image: (typeof c.image === "string" ? c.image : c.image?.src) || undefined,
      parent: norm(c.parent || c.parentSlug || c.ParentSlug) || undefined,
    }))

    // 2) productos planos para catálogo
    const flatProducts = prods.slice(0, productLimit > 0 ? productLimit : prods.length).map((p: any) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      path: p.path || `/productos/${p.slug}`,
      description: p.description ?? p.shortDescription ?? "",
      image: (typeof p.image === "string" ? p.image : p.image?.src) || undefined,
      alt: p.alt ?? "",
      categorySlug: norm(p.categorySlug ?? p.CategorySlug),
      categories: getProductCategorySlugs(p).filter(
        (slug) => slug !== norm(p.categorySlug ?? p.CategorySlug)
      ),
      featured: !!(p.featured ?? p.isFeatured ?? p.IsFeatured),
      order: n(p.order ?? p.sortOrder ?? p.SortOrder),
      inStock: p.inStock ?? true,
      searchTerms: Array.isArray(p.searchTerms) ? p.searchTerms : [],
    }))

    // 3) árbol para navegación
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

    const roots: any[] = []
    for (const s in bySlug) {
      const node = bySlug[s]
      if (node.parent && bySlug[node.parent]) bySlug[node.parent].children.push(node)
      else roots.push(node)
    }

    const sortTree = (nodes: any[]) => {
      nodes.sort((a, b) => n(a.order) - n(b.order))
      for (const node of nodes) {
        if (node.children?.length) sortTree(node.children)
      }
    }
    sortTree(roots)

    if (productLimit > 0) {
      const byCat: Record<string, any[]> = {}

      for (const p of prods) {
        const categorySlugs = getProductCategorySlugs(p)

        for (const slug of categorySlugs) {
          ;(byCat[slug] ||= []).push({
            id: p.id,
            slug: p.slug,
            title: p.title,
            image: (typeof p.image === "string" ? p.image : p.image?.src) || undefined,
            path: p.path || `/productos/${p.slug}`,
            order: n(p.order ?? p.sortOrder ?? p.SortOrder),
          })
        }
      }

      const attach = (nodes: any[]) => {
        for (const node of nodes) {
          if (node.children?.length) {
            attach(node.children)
          } else {
            node.products = byCat[norm(node.slug)]?.slice(0, productLimit) ?? []
          }
        }
      }

      attach(roots)
    }

    const indexBySlug: Record<string, any> = {}
    const walk = (nodes: any[]) => {
      for (const node of nodes) {
        indexBySlug[norm(node.slug)] = node
        if (node.children?.length) walk(node.children)
      }
    }
    walk(roots)

    return {
      categories: flatCategories,
      products: mode === "catalog" || includeProducts ? flatProducts : [],
      totalProducts: prods.length,

      tree: roots,
      indexBySlug,
      menuItems: roots,
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