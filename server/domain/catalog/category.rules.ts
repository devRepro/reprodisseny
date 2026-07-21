// server/mappers/cms/category.mapper.ts
import type { CmsCategory, CmsImage } from "./catalog.types";

function resolveCategoryPath(fields: Record<string, unknown>): string {
  const slug = String(fields.CategorySlug ?? fields.Slug ?? "").trim();
  if (!slug || slug === "categorias") return "/categorias";
  return `/categorias/${slug}`.replace(/\/{2,}/g, "/");
}

function mapImage(fields: Record<string, unknown>): CmsImage {
  const src = String(fields.ImageSrc ?? fields.ImageURL ?? fields.ThumbnailUrl ?? "").trim();
  if (!src) return null;
  return {
    src,
    alt: String(fields.ImageAlt ?? fields.Title ?? "").trim() || undefined,
  };
}

export function mapCmsCategory(fields: Record<string, unknown>): CmsCategory {
    const slug = String(fields.CategorySlug ?? fields.Slug ?? "").trim();
    return {
      id: String(fields.id),
      type: slug.includes("/") ? "subcategoria" : "categoria",
      slug,
      title: String(fields.NavLabel ?? fields.Title ?? "").trim(),
      nav: String(fields.NavLabel ?? fields.Title ?? "").trim(),
      path: resolveCategoryPath(fields),
      featured: Boolean(fields.IsFeatured ?? fields.Featured),
      hidden: Boolean(fields.IsHidden ?? fields.Hidden),
      isPublished: fields.IsPublished !== false,
      image: mapImage(fields),
      order: Number(fields.SortOrder ?? fields.Order ?? 0),
    }
  }