import { defineEventHandler } from "h3";
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server";

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export default defineEventHandler(async () => {
  const { categories } = await getCmsCatalog();

  const rows = (categories || [])
    .filter((c: any) => c?.isPublished !== false && c?.hidden !== true)
    .sort((a: any, b: any) => n(a.order ?? a.sortOrder ?? a.SortOrder) - n(b.order ?? b.sortOrder ?? b.SortOrder));

  return rows.map((c: any) => ({
    id: c.id,
    slug: c.slug,
    path: c.path || (c.slug ? `/categorias/${c.slug}` : "/categorias"),
    title: c.title,
    nav: c.nav ?? c.title,
    description: c.description ?? "",
    image: (typeof c.image === "string" ? c.image : c.image?.src) || null,
    featured: !!(c.featured ?? c.isFeatured ?? c.IsFeatured),
    order: n(c.order ?? c.sortOrder ?? c.SortOrder),
  }));
});




