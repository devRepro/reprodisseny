import { useRuntimeConfig } from "#imports"
import { getGraphClient } from "~/server/utils/graphClient.server"

export async function fetchSharePointProductsRaw(event: any): Promise<any[]> {
  const cfg = useRuntimeConfig(event) as any
  const listId = cfg.sharepoint?.cms?.productsListId
  if (!listId) throw new Error("Falta sharepoint.cms.productsListId")

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
    "CategorySlug",
    "CategoryPath",
    "SubcategorySlug",
    "SubcategoryPath",
    "Description",
    "BodyMd",
    "Image",
    "GalleryImages",
    "Breadcrumbs",
    "Seo",
    "UpdatedAt",
    "Sku",
  ].join(",")

  const url =
    `/sites/${encodeURIComponent(siteId)}` +
    `/lists/${listId}/items` +
    `?$top=500&$expand=fields($select=${encodeURIComponent(select)})`

  const data = await graph.api(url).get()
  return data?.value ?? []
}