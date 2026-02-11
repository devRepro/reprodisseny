// server/api/categorias.get.ts
import { defineEventHandler } from "h3"
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server"

export default defineEventHandler(async () => {
  const catalog = await getCmsCatalog()

  // Ajusta el shape a tu catalog real:
  return {
    categories: catalog.categories ?? [],
    updatedAt: catalog.updatedAt ?? null,
  }
})
