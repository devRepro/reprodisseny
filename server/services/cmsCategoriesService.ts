// server/services/cmsCategoriesService.ts
import { useRuntimeConfig } from "#imports"
import { getGraphClient } from "~/server/utils/graph" // tu utils multi-ctx

type CategoryItem = {
  id: string
  title: string
  slug: string
  order: number
  parent?: string | null
  featured: boolean
  hidden: boolean
  // añade lo que necesites
}

export async function fetchCmsCategories(event: any): Promise<CategoryItem[]> {
  const cfg = useRuntimeConfig(event) as any
  const listId = cfg.sharepoint?.cms?.categoriesListId
  if (!listId) throw new Error("Falta sharepoint.cms.categoriesListId")

  const graph = await getGraphClient(event, "cms")
  const siteId = await graph.resolveSiteId()

  // ⚠️ Ajusta nombres internos de campos SP (Slug, Order, Featured...) según tu lista real
  const url =
    `/sites/${encodeURIComponent(siteId)}` +
    `/lists/${listId}/items` +
    `?$top=500&$expand=fields`

  const data = await graph.api(url).get()
  const items = (data?.value ?? []) as any[]

  return items
    .map((it) => it.fields || {})
    // si tienes un boolean tipo IsPublished, filtra aquí:
    .filter((f) => f.IsPublished !== false) // adapta
    .map((f) => ({
      id: String(f.id ?? f.ID ?? ""), // adapta
      title: String(f.Title ?? ""),
      slug: String(f.Slug ?? ""),
      order: Number(f.Order ?? 0),
      parent: f.Parent ? String(f.Parent) : null,
      featured: Boolean(f.Featured),
      hidden: Boolean(f.Hidden),
    }))
    .sort((a, b) => a.order - b.order)
}
