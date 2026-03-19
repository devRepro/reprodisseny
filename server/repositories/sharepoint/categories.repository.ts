import { useRuntimeConfig } from "#imports"
import { getGraphClient } from "~/server/utils/graphClient.server"

export async function fetchSharePointCategoriesRaw(event: any): Promise<any[]> {
  const cfg = useRuntimeConfig(event) as any
  console.log("[categories.repository] cms config =", cfg.sharepoint?.cms)
  const listId = cfg.sharepoint?.cms?.categoriesListId
  if (!listId) throw new Error("Falta sharepoint.cms.categoriesListId")

  const graph = await getGraphClient(event, "cms")
  const siteId = await graph.resolveSiteId()

  const select = [
    "Title",
    "Type",
    "Slug",
    "Path",
    "Nav",
    "Order",
    "Hidden",
    "Featured",
    "IsPublished",
    "ParentSlug",
    "ParentPath",
    "Description",
    "BodyMd",
    "Tabs",
    "Image",
    "Cta",
    "Faqs",
    "GalleryImages",
    "Breadcrumbs",
    "LegacySlugs",
    "FaqsJson",
    "Seo",
    "UpdatedAt",
  ].join(",")

  const url =
    `/sites/${encodeURIComponent(siteId)}` +
    `/lists/${listId}/items` +
    `?$top=500&$expand=fields($select=${encodeURIComponent(select)})`

  const data = await graph.api(url).get()
  return data?.value ?? []
}