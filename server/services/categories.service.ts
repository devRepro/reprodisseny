// server/services/categories.service.ts
import type { CmsCategory, HomeCategoryCardDto } from "~/server/domain/catalog/catalog.types"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

function normSlug(v: unknown) {
  return String(v ?? "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/^\/?categorias\//i, "")
    .replace(/^categorias\//i, "")
    .replace(/^\/+|\/+$/g, "")
}

function normPath(v: unknown, slug?: unknown) {
  let s = String(v ?? "").trim()

  if (!s) {
    const cleanSlug = normSlug(slug)
    return cleanSlug ? `/categorias/${cleanSlug}` : ""
  }

  if (!s.startsWith("/")) s = "/" + s
  s = s.replace(/\/{2,}/g, "/")

  if (!s.startsWith("/categorias/")) {
    s = "/categorias/" + s.replace(/^\/+/, "")
  }

  return s.replace(/\/+$/, "")
}

function toBool(v: unknown, def = false) {
  if (v === undefined || v === null) return def
  if (typeof v === "boolean") return v

  const s = String(v).trim().toLowerCase()
  if (["true", "1", "yes", "si"].includes(s)) return true
  if (["false", "0", "no"].includes(s)) return false

  return def
}

function toNum(v: unknown, def = 0) {
  const n = typeof v === "number" ? v : Number(String(v ?? "").trim())
  return Number.isFinite(n) ? n : def
}

function normAssetSrc(v: unknown) {
  let s = String(v ?? "").trim()
  if (!s) return ""

  if (/^(https?:)?\/\//i.test(s) || s.startsWith("data:") || s.startsWith("blob:")) {
    return s
  }

  s = s.replace(/\\/g, "/")
  s = s.replace(/^\.?\//, "")
  s = s.replace(/^\/+/, "")

  return "/" + s
}

function mapCatalogCategoryToCmsCategory(c: any, index: number): CmsCategory {
  const slug = normSlug(c?.slug || c?.categorySlug)
  const path = normPath(c?.path, slug)

  return {
    id: String(c?.id ?? slug ?? `cat-${index}`),
    slug,
    path,
    title: String(c?.title ?? c?.Title ?? ""),
    nav: String(c?.nav ?? c?.NavLabel ?? c?.title ?? c?.Title ?? ""),
    order: toNum(c?.order ?? c?.SortOrder, 0),
    parentSlug: c?.parentSlug
      ? normSlug(c.parentSlug)
      : c?.parent
        ? normSlug(c.parent)
        : null,
    featured: toBool(c?.featured ?? c?.Featured, false),
    hidden: toBool(c?.hidden ?? c?.Hidden, false),
    isPublished: toBool(c?.isPublished ?? c?.IsPublished, true),
    description: String(c?.description ?? c?.Description ?? ""),
    image: c?.image
      ? {
          ...c.image,
          src: normAssetSrc(c.image.src),
          alt: c.image.alt ?? c?.ImageAlt ?? c?.title ?? c?.Title ?? "",
        }
      : (c?.imageSrc || c?.ImageSrc)
        ? {
            src: normAssetSrc(c?.imageSrc || c?.ImageSrc),
            alt: c?.ImageAlt ?? c?.alt ?? c?.title ?? c?.Title ?? "",
          }
        : undefined,
  } as CmsCategory
}

function isPublicCategory(c: CmsCategory) {
  return c.isPublished && !c.hidden && !!c.path
}

function sortByOrder(a: CmsCategory, b: CmsCategory) {
  return (a.order ?? 0) - (b.order ?? 0)
}

function toHomeCategoryCardDto(c: CmsCategory): HomeCategoryCardDto {
  return {
    id: c.id,
    slug: c.slug,
    title: c.nav || c.title,
    href: c.path,
    image: c.image,
    order: c.order,
  }
}

export async function fetchCmsCategories(_event?: any): Promise<CmsCategory[]> {
  const catalog = await getCmsCatalog()
  const categories = Array.isArray(catalog?.categories) ? catalog.categories : []

  return categories
    .map(mapCatalogCategoryToCmsCategory)
    .filter(isPublicCategory)
    .sort(sortByOrder)
}

export async function fetchHomeCategories(event?: any): Promise<HomeCategoryCardDto[]> {
  const categories = await fetchCmsCategories(event)

  return categories
    .filter((c) => c.featured)
    .sort(sortByOrder)
    .map(toHomeCategoryCardDto)
}