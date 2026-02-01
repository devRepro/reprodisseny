// server/services/cmsCategoriesService.ts
import { useRuntimeConfig } from "#imports"
import { getGraphClient } from "~/server/utils/graphClient.server" // <- adjust if you have a wrapper file

type CategoryItem = {
  id: string
  title: string
  slug: string
  order: number
  parentSlug?: string | null
  featured: boolean
  hidden: boolean
  isPublished: boolean
}

export async function fetchCmsCategories(event: any): Promise<CategoryItem[]> {
  const cfg = useRuntimeConfig(event) as any
  const listId = cfg.sharepoint?.cms?.categoriesListId
  if (!listId) throw new Error("Falta sharepoint.cms.categoriesListId")

  const graph = await getGraphClient(event, "cms")
  const siteId = await graph.resolveSiteId()

  // NOTE: Select only what you need (faster + cheaper)
  const select = [
    "Title",
    "Slug",
    "Order",
    "ParentSlug",     // <- recommended: store parent slug as text
    "Featured",
    "Hidden",
    "IsPublished",
  ].join(",")

  const url =
    `/sites/${encodeURIComponent(siteId)}` +
    `/lists/${listId}/items` +
    `?$top=500&$expand=fields($select=${encodeURIComponent(select)})`

  const data = await graph.api(url).get()
  const items = (data?.value ?? []) as any[]

  return items
    .map((it) => {
      const f = it.fields || {}
      return {
        id: String(it.id), // <- FIX: id is item.id, not fields
        title: String(f.Title ?? ""),
        slug: String(f.Slug ?? ""),
        order: Number(f.Order ?? 0),
        parentSlug: f.ParentSlug ? String(f.ParentSlug) : null,
        featured: Boolean(f.Featured),
        hidden: Boolean(f.Hidden),
        isPublished: f.IsPublished !== false,
      }
    })
    .filter((c) => c.isPublished && !c.hidden && c.slug)
    .sort((a, b) => a.order - b.order)
}
