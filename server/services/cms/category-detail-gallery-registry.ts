import galleryRegistry from "@/server/data/category-detail-gallery.json";

export type CategoryDetailMediaRole = "primary" | "detail" | "usage";

export type CategoryDetailMediaItemDto = {
  src: string;
  alt: string;
  caption?: string;
  role?: CategoryDetailMediaRole;
};

type CategoryGalleryRegistry = Record<string, CategoryDetailMediaItemDto[]>;

const registry = galleryRegistry as CategoryGalleryRegistry;

export function getCategoryDetailGalleryBySlug(
  slug?: string | null
): CategoryDetailMediaItemDto[] {
  if (!slug) return [];
  return Array.isArray(registry[slug]) ? registry[slug].slice(0, 3) : [];
}