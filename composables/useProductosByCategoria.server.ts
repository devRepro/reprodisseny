// composables/useProductosByCategoria.server.ts
import { useAsyncData, useRoute } from '#imports'
import { queryCollection } from '@nuxt/content/dist/runtime/server'
import type { Producto } from '@/types'

export const useProductosByCategoria = () => {
  const route = useRoute()
  const searchPath = route.path
  const key = `productos-${searchPath}`

  return useAsyncData(key, async () => {
    try {
      const products = await queryCollection('categorias')
        .where('_path', 'LIKE', `${searchPath}/%`)
        .where('_path', '<>', `${searchPath}/index`)
        .where('type', '=', 'producto')
        .select('_path','title','slug','image','alt')
        .order('order','ASC')
        .order('title','ASC')
        .all()  // ← usar .all(), no .find()
      return products as Producto[]
    } catch (e) {
      console.error(e)
      return []
    }
  })
}
