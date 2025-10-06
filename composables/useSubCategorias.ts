// composables/useSubcategorias.ts
import { useRoute } from 'vue-router'
import type { CategoriasPayload, CategoriaNodeNav } from '@/types'

export function useSubcategorias(parentSlug?: string) {
  const route = useRoute()
  const id = computed(() => {
    const raw = parentSlug || (Array.isArray(route.params.slug) ? route.params.slug.join('/') : String(route.params.slug || ''))
    return (raw || '').replace(/^\/+|\/+$/g, '') // clean
  })

  return useAsyncData<{ items: CategoriaNodeNav[] }>(
    () => `subcats:${id.value}`,
    async () => {
      const data = await $fetch<CategoriasPayload>('/api/categorias')
      const node = data.indexById[id.value]
      return { items: node?.children || [] }
    },
    { server: true, watch: [() => id.value], dedupe: 'defer', default: () => ({ items: [] }) }
  )
}
