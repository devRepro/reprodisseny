import { defineEventHandler, getRouterParam, createError } from "h3";
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") || "";
  const { products } = await getCmsCatalog();

  const product = (products || []).find((p: any) => p.slug === slug && p?.isPublished !== false && p?.hidden !== true);
  if (!product) throw createError({ statusCode: 404, statusMessage: "Producto no encontrado" });

  return product;
});
