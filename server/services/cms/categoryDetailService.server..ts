import { useRuntimeConfig } from "#imports"
import { getGraphClient } from "~/server/utils/graphClient.server"

export type CategoryDetail = {
  id: string
  title: string
  slug: string
  order: number
  parentSlug?: string | null
  featured: boolean
  hidden: boolean
  isPublished: boolean

  // Content/SEO
  bodyMd?: string | null
  seoTitle?: string | null
  seoDescription?: string | null

  // Images
  imageSrc?: string | null
  heroImageUrl?: string | null
  ogImageSrc?: string | null
}

function escOData(v: string) {
  return String(v || "").replace(/'/g, "''")
}

function toBool(v: any) {
  return v === true || v === "true" || v === 1
}

function pickString(v: any): string | null {
  const s = String(v ?? "").trim()
  return s ? s : null
}

/**
 * Detalle por slug: contenido + SEO + imágenes.
 * Ajusta nombres internos si tu lista usa otros.
 */
export async function fetchCategoryDetailBySlug(
  event: any,
  slug: string
): Promise<CategoryDetail | null> {
  const clean = String(slug || "").trim()
  if (!clean) return null

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
    "BodyMd",
    "SeoTitle",
    "SeoDescription",
    "ImageSrc",
    "HeroImageUrl",
    "OgImageSrc",
  ].join(",")

  const url =
    `/sites/${encodeURIComponent(siteId)}` +
    `/lists/${listId}/items` +
    `?$top=1` +
    `&$expand=fields($select=${encodeURIComponent(select)})` +
    `&$filter=${encodeURIComponent(`fields/Slug eq '${escOData(clean)}'`)}`

  const data = await graph.api(url).get()
  const it = (data?.value ?? [])[0]
  if (!it?.fields) return null

  const f = it.fields || {}
  const isPublished = f.IsPublished !== false
  const hidden = toBool(f.Hidden)
  if (!isPublished || hidden) return null

  return {
    id: String(it.id),
    title: String(f.Title ?? ""),
    slug: String(f.Slug ?? ""),
    order: Number(f.Order ?? 0),
    parentSlug: pickString(f.ParentSlug),
    featured: toBool(f.Featured),
    hidden,
    isPublished,

    bodyMd: pickString(f.BodyMd),
    seoTitle: pickString(f.SeoTitle),
    seoDescription: pickString(f.SeoDescription),

    imageSrc: pickString(f.ImageSrc),
    heroImageUrl: pickString(f.HeroImageUrl),
    ogImageSrc: pickString(f.OgImageSrc),
  }
}
