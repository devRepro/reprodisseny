// composables/useCategoriasHome.server.ts
import { useAsyncData } from '#imports'

import type { Categoria } from '@/types'

export function useCategoriasHome() {
  return useAsyncData<Categoria[]>(
    'categorias-home',
    () =>
      queryCollection('categorias')
        .where('type', '=', 'categoria')      // filtrar sólo “categoria”
        .order('title', 'ASC')               // ordenar alfabéticamente
        .limit(10)                           // traer como máximo 10
        .select('title','slug','image') // sólo los campos que usas
        .all(),
    { default: () => [] }                   // evita undefined en SSR/hidratación
  )
}
