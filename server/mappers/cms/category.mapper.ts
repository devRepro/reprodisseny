import type { CmsCategory, CmsImage } from "~/server/domain/catalog/catalog.types"

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
        return new URL(raw).pathname || "/categorias"
      } catch {
        return "/categorias"
      }
    }
    return raw.startsWith("/") ? raw : `/${raw}`
  }

  const canon = s(canonical)
  if (canon) {
    try {
      return new URL(canon).pathname || "/categorias"
    } catch {}
  }

  const safeSlug = s(slug)
  return safeSlug ? `/categorias/${safeSlug}` : "/categorias"
}

function normalizeImage(value: any, fallbackAlt = ""): CmsImage {
  if (!value) return null

  const img = typeof value === "string" ? { src: value } : value
  const src = s(img?.src)
  if (!src) return null

  return {
    src,
    alt: s(img?.alt) || fallbackAlt,
    width: n(img?.width) || undefined,
    height: n(img?.height) || undefined,
  }
}

export function mapCmsCategoryItem(it: any): CmsCategory {
  const f = it?.fields ?? it ?? {}
  const title = s(f.title ?? f.Title)
  const nav = s(f.nav ?? f.Nav) || title
  const slug = s(f.slug ?? f.Slug)

  const seo = parseJsonMaybe(f.seo ?? f.Seo, {})
  const path = normalizePath(f.path ?? f.Path, seo?.canonical, slug)

  return {
    id: String(it?.id ?? f.id ?? ""),
    type: (s(f.type ?? f.Type) || "categoria") as "categoria" | "subcategoria",
    slug,
    path,
    title,
    nav,
    order: n(f.order ?? f.Order),
    hidden: b(f.hidden ?? f.Hidden),
    featured: b(f.featured ?? f.Featured),
    isPublished: f.isPublished ?? f.IsPublished ?? true,
    parentSlug: s(f.parentSlug ?? f.ParentSlug) || null,
    parentPath: s(f.parentPath ?? f.ParentPath) || null,
    description: s(f.description ?? f.Description),
    bodyMd: s(f.bodyMd ?? f.BodyMd),
    tabs: parseJsonMaybe(f.tabs ?? f.Tabs, []),
    image: normalizeImage(f.image ?? f.Image, nav || title),
    cta: parseJsonMaybe(f.cta ?? f.Cta, null),
    faqs: parseJsonMaybe(f.faqs ?? f.Faqs, []),
    galleryImages: parseJsonMaybe(f.galleryImages ?? f.GalleryImages, []),
    breadcrumbs: parseJsonMaybe(f.breadcrumbs ?? f.Breadcrumbs, []),
    legacySlugs: parseJsonMaybe(f.legacySlugs ?? f.LegacySlugs, []),
    seo: parseJsonMaybe(f.seo ?? f.Seo, {}),
    updatedAt: s(f.updatedAt ?? f.UpdatedAt),
  }
}