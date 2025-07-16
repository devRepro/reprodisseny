// composables/useCategoriaData.ts
import { ref, watch, type Ref } from 'vue'
import { queryCollection } from '@/api' // ajusta al helper real que uses

export function useCategoriaData(fullSlug: Ref<string>) {
  const contentData = ref<any>(null)
  const pending     = ref(true)
  const error       = ref<Error|null>(null)

  watch(
    fullSlug,
    async (slug) => {
      if (!slug) {
        contentData.value = null
        pending.value     = false
        return
      }
      pending.value = true
      error.value   = null
      try {
        const path = `/categorias/${slug}`
        const [res] = await queryCollection('categorias')
          .where({ _path: path })
          .find()
        contentData.value = res
      } catch (err: any) {
        error.value       = err
        contentData.value = null
      } finally {
        pending.value = false
      }
    },
    { immediate: true }
  )

  return { contentData, pending, error }
}

