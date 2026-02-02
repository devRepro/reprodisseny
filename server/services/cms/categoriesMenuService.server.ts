import { useRuntimeConfig } from "#imports"
import { getGraphClient } from "~/server/utils/graphClient.server"

export type CategoryMenuItem = {
  id: string
  title: string
  slug: string
  order: number
  parentSlug?: string | null
  featured: boolean
  hidden: boolean
  isPublished: boolean

  // si el grid necesita imagen, déjalo aquí (recomendado)
  imageSrc?: string | null
  heroImageUrl?: string | null
}

function toBool(v: any) {
  return v === true || v === "true" || v === 1
}

function pickString(v: any): string | null {
  const s = String(v ?? "").trim()
  return s ? s : null
}

/**
 * Menú / grid: rápido y barato.
 */
export async function fetchCategoriesForMenu(event: any): Promise<CategoryMenuItem[]> {
  const cfg = useRuntimeConfig(event) as any
  const listId = cfg.sharepoint?.cms?.categoriesListId
  if (!listId) throw new Error("Falta sharepoint.cms.categoriesListId")

  const graph = await getGraphClient(event, "cms")
  const siteId = await graph.resolveSiteId()

  const select = [
    "Title",
    "Slug",
    "Order",
    "ParentSlug",
    "Featured",
    "Hidden",
    "IsPublished",
    "ImageSrc",
    "HeroImageUrl",
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
        id: String(it.id),
        title: String(f.Title ?? ""),
        slug: String(f.Slug ?? ""),
        order: Number(f.Order ?? 0),
        parentSlug: pickString(f.ParentSlug),
        featured: toBool(f.Featured),
        hidden: toBool(f.Hidden),
        isPublished: f.IsPublished !== false,
        imageSrc: pickString(f.ImageSrc),
        heroImageUrl: pickString(f.HeroImageUrl),
      } satisfies CategoryMenuItem
    })
    .filter((c) => c.isPublished && !c.hidden && c.slug)
    .sort((a, b) => a.order - b.order)
}
