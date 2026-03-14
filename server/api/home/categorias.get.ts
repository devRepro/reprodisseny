import { defineEventHandler, getQuery } from "h3"
import { fetchHomeCategories } from "~/server/services/cms/categories.service"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit ?? 8)

  return await fetchHomeCategories(event, Number.isFinite(limit) ? limit : 8)
})