// composables/useProductosByCategoria.ts
import { useAsyncData, useRoute } from '#imports'
import { fetchProductosByCategoria } from './useProductosByCategoria.server'
import type { Producto } from '@/types'

export function useProductosByCategoria() {
  const route = useRoute()
  const key = `productos-${route.path}`
  return useAsyncData<Producto[]>(key, () => fetchProductosByCategoria(route.path))
}