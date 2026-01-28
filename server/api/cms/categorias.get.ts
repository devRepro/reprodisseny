// server/api/cms/categorias.get.ts
import { defineCachedEventHandler } from "nitro" // disponible en Nuxt/Nitro
import { fetchCmsCategories } from "~/server/services/cmsCategoriesService"

export default defineCachedEventHandler(
  async (event) => {
    const items = await fetchCmsCategories(event)
    return { items }
  },
  {
    // 5 minutos “fresh”
    maxAge: 60 * 5,

    // SWR ON por defecto (sirve stale y revalida en background)
    // Puedes dejarlo explícito:
    swr: true,

    // Si quieres permitir stale mientras revalida:
    staleMaxAge: -1,

    // Si tienes varios dominios/hosts, separa caché por host
    varies: ["host"],
  }
)
