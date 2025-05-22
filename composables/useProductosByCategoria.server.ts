// composables/useProductosByCategoria.server.ts
import { queryCollection } from '#imports'
import type { Producto } from '@/types'

export async function fetchProductosByCategoria(path: string): Promise<Producto[]> {
  try {
    return await queryCollection('categorias')
      .where('_path', 'LIKE', `${path}/%`)
      .where('_path', '<>', `${path}/index`)
      .where('type', '=', 'producto')
      .select('_path', 'title', 'slug', 'image', 'alt')
      .order('order', 'ASC')
      .order('title', 'ASC')
      .all()
  } catch (e) {
    console.error(e)
    return []
  }
}