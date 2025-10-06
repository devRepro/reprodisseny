// composables/useCategoriasHome.ts
import type { CategoriasHomePayload } from '@/types/categorias'

export function useCategoriasHome(limit = 8) {
  const key = `categorias-home-${limit}`

  return useAsyncData<CategoriasHomePayload>(
    key,                                  // ✅ clave string estable
    () => $fetch<CategoriasHomePayload>('/api/categorias/home', {
      params: { limit }                   // ✅ filtramos en servidor
    }),
    {
      server: true,
      dedupe: 'defer',
      default: () => ({ items: [] })
    }
  )
}

