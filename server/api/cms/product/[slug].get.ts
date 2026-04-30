import { getProductDetailBySlug } from "~/server/services/cms/_catalog.service";

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, "slug") || "";
  const data = getProductDetailBySlug(String(slug));

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: "Producto no encontrado",
    });
  }

  return data;
});