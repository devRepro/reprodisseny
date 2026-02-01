import { defineEventHandler, getRouterParam, createError } from "h3"
import { getCategoryPageBySlug } from "~/server/services/cms/categoryService.server"

export default defineEventHandler(async (event) => {
  const slug = (getRouterParam(event, "slug") || "").trim()
  const dto = await getCategoryPageBySlug(slug)

  if (!dto) throw createError({ statusCode: 404, statusMessage: "Categoría no encontrada" })
  return dto
})
