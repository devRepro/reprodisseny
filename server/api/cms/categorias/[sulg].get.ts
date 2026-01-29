import { defineEventHandler, getRouterParam, createError } from "h3";
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") || "";
  const { categories } = await getCmsCatalog();

  const category = (categories || []).find((c: any) => c.slug === slug && c?.isPublished !== false && c?.hidden !== true);
  if (!category) throw createError({ statusCode: 404, statusMessage: "Categoría no encontrada" });

  return category;
});
