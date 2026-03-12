// server/api/cms/catalog-list.get.ts
import { getQuery, setHeader } from "h3"
import { defineCachedEventHandler } from "nitropack/runtime"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

function toPositiveInt(value: unknown, fallback: number) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

function norm(value: unknown) {
  return String(value ?? "").trim().toLowerCase()
}

function productMatchesQuery(product: any, query: string) {
  if (!query) return true

  const haystack = [
    product?.title,
    product?.description,
    product?.primaryCategory,
    ...(Array.isArray(product?.categories) ? product.categories : []),
    ...(Array.isArray(product?.categorySlugs) ? product.categorySlugs : []),
    ...(Array.isArray(product?.searchTerms) ? product.searchTerms : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return haystack.includes(query)
}

function productSort(a: any, b: any, sort: string) {
  switch (sort) {
    case "az":
      return String(a?.title ?? "").localeCompare(String(b?.title ?? ""), "es")
    case "za":
      return String(b?.title ?? "").localeCompare(String(a?.title ?? ""), "es")
    case "relevance":
    default: {
      const aFeatured = Boolean(a?.featured)
      const bFeatured = Boolean(b?.featured)

      if (aFeatured !== bFeatured) return aFeatured ? -1 : 1

      const aOrder = Number(a?.order ?? 999999)
      const bOrder = Number(b?.order ?? 999999)

      if (aOrder !== bOrder) return aOrder - bOrder

      return String(a?.title ?? "").localeCompare(String(b?.title ?? ""), "es")
    }
  }
}

export default defineCachedEventHandler(
  async (event) => {
    const q = getQuery(event)

    const page = toPositiveInt(q.page, 1)
    const perPage = Math.min(toPositiveInt(q.perPage, 12), 48)
    const category = norm(q.category)
    const search = norm(q.q)
    const sort = String(q.sort || "relevance").trim() || "relevance"

    setHeader(
      event,
      "Cache-Control",
      "public, max-age=0, s-maxage=300, stale-while-revalidate=3600"
    )

    const { categories, products } = await getCmsCatalog()

    const flatCategories = (Array.isArray(categories) ? categories : [])
      .filter((c: any) => c?.hidden !== true && c?.isPublished !== false)
      .filter((c: any) => c?.showInNav !== false)
      .map((c: any) => ({
        id: c?.id,
        slug: c?.slug,
        title: c?.title,
        nav: c?.navTitle || c?.nav || c?.title || c?.slug,
        label: c?.navTitle || c?.nav || c?.title || c?.slug,
        order: Number(c?.navOrder ?? c?.order ?? c?.sortOrder ?? 999999),
        path: c?.path || `/categorias/${c?.slug}`,
        image:
          typeof c?.image === "string"
            ? c.image
            : c?.image?.src || c?.ImageSrc || undefined,
      }))
      .filter((c: any) => c.slug && c.title)
      .sort((a: any, b: any) => a.order - b.order)

    let filtered = (Array.isArray(products) ? products : [])
      .filter((p: any) => p?.hidden !== true && p?.isPublished !== false)
      .filter((p: any) => p?.slug && p?.title)
      .filter((p: any) => p?.inStock !== false)
      .map((p: any) => ({
        id: p?.id,
        slug: p?.slug,
        title: p?.title,
        path: p?.path || `/productos/${p?.slug}`,
        description: p?.description || "",
        image:
          typeof p?.image === "string"
            ? p.image
            : p?.image?.src || p?.ImageSrc || undefined,
        alt: p?.alt || p?.image?.alt || "",
        primaryCategory: p?.primaryCategory || "",
        categories: Array.isArray(p?.categories) ? p.categories : [],
        categorySlugs: Array.isArray(p?.categorySlugs) ? p.categorySlugs : [],
        featured: Boolean(p?.featured),
        order: Number(p?.order ?? p?.sortOrder ?? 999999),
        inStock: p?.inStock !== false,
        searchTerms: Array.isArray(p?.searchTerms) ? p.searchTerms : [],
      }))

    if (category) {
      filtered = filtered.filter((p: any) =>
        Array.isArray(p.categorySlugs) && p.categorySlugs.includes(category)
      )
    }

    if (search) {
      filtered = filtered.filter((p: any) => productMatchesQuery(p, search))
    }

    filtered = filtered.slice().sort((a: any, b: any) => productSort(a, b, sort))

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / perPage))
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * perPage
    const items = filtered.slice(start, start + perPage)

    return {
      items,
      total,
      page: safePage,
      perPage,
      totalPages,
      categories: flatCategories,
    }
  },
  {
    maxAge: 60 * 5,
    swr: true,
    getKey: (event) => {
      const q = getQuery(event)

      return [
        "cmsCatalogList",
        String(q.page || 1),
        String(q.perPage || 12),
        String(q.category || ""),
        String(q.q || ""),
        String(q.sort || "relevance"),
      ].join(":")
    },
    shouldInvalidateCache: (event) => getQuery(event).refresh === "1",
  }
)