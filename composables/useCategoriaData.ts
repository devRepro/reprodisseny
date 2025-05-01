import { useRoute, showError } from '#imports'

export function useCategoriaData() {
  const route = useRoute()

  const slugParts = computed(() => route.params.slug as string[])
  const slug = computed(() => slugParts.value?.[slugParts.value.length - 1] || '')

  const { data: contentData, pending, error } = useAsyncData(`categoria-${slug.value}`, async () => {
    const result = await queryCollection('categorias')
      .where('slug', '=', slug.value)
      .first()

    if (!result) {
      throw showError({ statusCode: 404, statusMessage: 'Categoría no encontrada' })
    }

    return result
  })

  return { contentData, pending, error }
}
