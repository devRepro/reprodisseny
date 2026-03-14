import { fetchSharePointProductsRaw } from "~/server/repositories/sharepoint/products.repository"
import { mapCmsProductItem } from "~/server/mappers/cms/product.mapper"

export async function fetchCmsProducts(event: any) {
  const raw = await fetchSharePointProductsRaw(event)

  return raw
    .map(mapCmsProductItem)
    .filter((p) => p.isPublished && !p.hidden && p.path)
    .sort((a, b) => a.order - b.order)
}