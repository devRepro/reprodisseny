// server/services/cmsCategoriesService.ts
import { fetchCmsCategories as fetchCatalogCategories } from "~/server/services/categories.service"

type CategoryItem = {
  id: string
  title: string
  slug: string
  path: string
  order: number
  parentSlug?: string | null
  featured: boolean
  hidden: boolean
  isPublished: boolean
}

export async function fetchCmsCategories(event?: any): Promise<CategoryItem[]> {
  const categories = await fetchCatalogCategories(event)

  return categories.map((c) => ({
    id: String(c.id),
    title: String(c.title ?? c.nav ?? ""),
    slug: String(c.slug ?? ""),
    path: String(c.path ?? ""),
    order: Number(c.order ?? 0),
    parentSlug: c.parentSlug ? String(c.parentSlug) : null,
    featured: Boolean(c.featured),
    hidden: Boolean(c.hidden),
    isPublished: c.isPublished !== false,
  }))
}