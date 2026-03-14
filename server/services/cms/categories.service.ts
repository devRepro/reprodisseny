import type { CmsCategory, HomeCategoryCardDto } from "~/server/domain/catalog/catalog.types"
import { fetchSharePointCategoriesRaw } from "~/server/repositories/sharepoint/categories.repository"
import { mapCmsCategoryItem } from "~/server/mappers/cms/category.mapper"


function isPublicCategory(c: CmsCategory) {
  return c.isPublished && !c.hidden && !!c.path
}

function sortByOrder(a: CmsCategory, b: CmsCategory) {
  return a.order - b.order
}

function toHomeCategoryCardDto(c: CmsCategory): HomeCategoryCardDto {
  return {
    id: c.id,
    slug: c.slug,
    title: c.nav || c.title, // mejor para grid/home
    href: c.path,            // fuente real de navegación
    image: c.image,
    order: c.order,
  }
}

export async function fetchCmsCategories(event: any): Promise<CmsCategory[]> {
  const raw = await fetchSharePointCategoriesRaw(event)

  return raw
    .map(mapCmsCategoryItem)
    .filter(isPublicCategory)
    .sort(sortByOrder)
}

export async function fetchHomeCategories(event: any): Promise<HomeCategoryCardDto[]> {
  const categories = await fetchCmsCategories(event)

  return categories
    .filter((c) => c.featured)
    .sort(sortByOrder)
    .map(toHomeCategoryCardDto)
}