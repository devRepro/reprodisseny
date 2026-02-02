import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

export async function getAllCategories() {
  const catalog = await getCmsCatalog()
  return (catalog.categories ?? []) as any[]
}

export async function getCategoryBySlug(slug: string) {
  const cats = await getAllCategories()
  return cats.find((c) => c?.slug === slug && c?.isPublished !== false && c?.hidden !== true) || null
}
