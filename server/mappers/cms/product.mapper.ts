import type { CmsProduct } from "~/server/domain/catalog/catalog.types"

const s = (v: unknown) => (typeof v === "string" ? v.trim() : "")
const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const b = (v: unknown) => Boolean(v)

function parseJsonMaybe<T>(value: unknown, fallback: T): T {
  if (!value) return fallback
  if (typeof value === "object") return value as T
  if (typeof value !== "string") return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function normalizePath(value?: string | null, canonical?: string | null, slug?: string | null) {
  const raw = s(value)
  if (raw) {
    if (/^https?:\/\//i.test(raw)) {
      try {
        return new URL(raw).pathname || "/productos"
      } catch {
        return "/productos"
      }
    }
    return raw.startsWith("/") ? raw : `/${raw}`
  }

  const canon = s(canonical)
  if (canon) {
    try {
      return new URL(canon).pathname || "/productos"
    } catch {
      // no-op
    }
  }

  const safeSlug = s(slug)
  return safeSlug ? `/productos/${safeSlug}` : "/productos"
}

export function mapCmsProductItem(it: any): CmsProduct {
  const f = it?.fields ?? it ?? {}
  const seo = parseJsonMaybe(f.seo ?? f.Seo, {})
  const slug = s(f.slug ?? f.Slug)

  return {
    id: String(it?.id ?? f.id ?? ""),
    type: "producto",
    slug,
    path: normalizePath(f.path ?? f.Path, seo?.canonical, slug),
    title: s(f.title ?? f.Title),
    nav: s(f.nav ?? f.Nav),
    sku: s(f.sku ?? f.Sku),
    categorySlug: s(f.categorySlug ?? f.CategorySlug) || null,
    categoryPath: s(f.categoryPath ?? f.CategoryPath) || null,
    subcategorySlug: s(f.subcategorySlug ?? f.SubcategorySlug) || null,
    subcategoryPath: s(f.subcategoryPath ?? f.SubcategoryPath) || null,
    order: n(f.order ?? f.Order),
    hidden: b(f.hidden ?? f.Hidden),
    featured: b(f.featured ?? f.Featured),
    isPublished: f.isPublished ?? f.IsPublished ?? true,
    description: s(f.description ?? f.Description),
    bodyMd: s(f.bodyMd ?? f.BodyMd),
    image: f.image ?? f.Image ?? null,
    galleryImages: parseJsonMaybe(f.galleryImages ?? f.GalleryImages, []),
    breadcrumbs: parseJsonMaybe(f.breadcrumbs ?? f.Breadcrumbs, []),
    seo: parseJsonMaybe(f.seo ?? f.Seo, {}),
    updatedAt: s(f.updatedAt ?? f.UpdatedAt),
  }
}