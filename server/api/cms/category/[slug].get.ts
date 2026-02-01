import { defineEventHandler, getRouterParam, createError } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, "slug") || "").trim()
  if (!slug) throw createError({ statusCode: 400, statusMessage: "Missing slug" })

  const catalog = await getCmsCatalog()
  const categories = (catalog.categories ?? []) as any[]

  const category = categories.find((c) => c?.slug === slug && c?.isPublished !== false && c?.hidden !== true)
  if (!category) throw createError({ statusCode: 404, statusMessage: "Categoría no encontrada" })

  const children = categories
    .filter((c) => c?.parentSlug === slug && c?.isPublished !== false && c?.hidden !== true)
    .sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0))

  return { category, children }
})
