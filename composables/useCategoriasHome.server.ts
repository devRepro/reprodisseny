// composables/useCategoriasHome.server.ts
import { useAsyncData } from '#imports'
import type { Categoria } from '@/types'

export function useCategoriasHome() {
  // 'categorias-home' es la key para SSR + cache
  return useAsyncData<Categoria[]>(
    'categorias-home',
    () =>
      queryCollection('categorias')
        .where('type', '=', 'categoria')
        .all()
  )
}
