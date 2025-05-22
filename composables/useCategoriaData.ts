// composables/useCategoriaData.ts
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from '#imports'        // ← usa el auto-import de Nuxt


export function useCategoriaData() {
  const route = useRoute()
  const slug = computed(() => route.params.slug)
  const fullSlug = computed(() =>
    Array.isArray(slug.value) ? slug.value.join('/') : slug.value || ''
  )

  const contentData = ref<any>(null)
  const pending     = ref(true)
  const error       = ref<Error|null>(null)

  watchEffect(async () => {
    if (!fullSlug.value) return
    pending.value = true
    try {
      const path = `/categorias/${fullSlug.value}`
      const [res] = await queryCollection('categorias')
        .where({ _path: path })
        .find()
      contentData.value = res
      error.value = null
    } catch (err: any) {
      error.value = err
      contentData.value = null
    } finally {
      pending.value = false
    }
  })

  return { contentData, pending, error }
}

