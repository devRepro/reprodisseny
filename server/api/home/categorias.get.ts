import { defineEventHandler, getQuery } from "h3"
import { fetchHomeCategories } from "~/server/services/cms/categories.service"

export default defineEventHandler(async (event) => {
  const data = await fetchHomeCategories(event)
  console.log("[home/categorias]", JSON.stringify(data, null, 2))
  return data
})