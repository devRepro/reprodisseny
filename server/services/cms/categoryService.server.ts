import type { H3Event } from "h3"
import { fetchCategoriesForMenu } from "~/server/services/cms/categoriesMenuService.server"
import { fetchCategoryDetailBySlug } from "~/server/services/cms/categoryDetailService.server"

export type CategoryPageDto = {
  category: Awaited<ReturnType<typeof fetchCategoryDetailBySlug>>
  children: Array<{
    id: string
    title: string
    slug: string
    order: number
    imageSrc?: string | null
    heroImageUrl?: string | null
  }>
}

export async function getCategoryPageBySlug(event: H3Event, slug: string): Promise<CategoryPageDto | null> {
  const category = await fetchCategoryDetailBySlug(event, slug)
  if (!category) return null

  const all = await fetchCategoriesForMenu(event)
  const children = all
    .filter((c) => c.parentSlug === category.slug)
    .map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      order: c.order,
      imageSrc: c.imageSrc ?? null,
      heroImageUrl: c.heroImageUrl ?? null,
    }))
    .sort((a, b) => a.order - b.order)

  return { category, children }
}
