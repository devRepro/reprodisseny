// composables/useCategoria.ts
import type { Categoria } from '@/types'

export function useCategoria(slug: Ref<string> | string) {
  const key = computed(() => `categoria-${typeof slug === 'string' ? slug : slug.value}`)

  const { data, pending, error, refresh } = useAsyncData<Categoria>(
    key,
    async () => {
      const result = await queryCollection('categorias')
        .where('slug', '=', typeof slug === 'string' ? slug : slug.value)
        .where('type', '=', 'categoria')
        .first()

      if (!result) {
        throw showError({ statusCode: 404, statusMessage: 'Categoría no encontrada' })
      }

      return result
    },
    {
      server: true,
      lazy: false,
      watch: typeof slug !== 'string' ? [slug] : undefined,
    }
  )

  return {
    categoria: data,
    pending,
    error,
    refresh,
  }
}
