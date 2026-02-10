// composables/useGoogleReviews.ts
import type { UiLocation } from '~/types/gbp'

type GbpReviewItem = {
  id: string
  name: string         // <- autor (displayName)
  rating: number       // 1..5
  comment?: string
  reply?: string | null
  updateTime?: string
}

export function useGoogleReviews() {
  // Si tu endpoint de ubicaciones funciona en SSR, NO pongas server:false
  const locationsRes = useFetch<{ locations: UiLocation[] }>('/api/gbp/locations', {
    key: 'gbp-locations',
    credentials: 'include'
  })

  const firstLocation = computed(() => locationsRes.data.value?.locations?.[0])

  const reviews = ref<GbpReviewItem[]>([])
  const average = ref<number | null>(null)    // si luego añades agregados
  const total = ref<number | null>(null)
  const pendingReviews = ref(false)
  const errorReviews = ref<unknown>(null)

  watch(
    () => firstLocation.value?.id,
    async (id) => {
      if (!id) return
      pendingReviews.value = true
      errorReviews.value = null
      try {
        // ⬇️ AHORA LEEMOS items (no reviews)
        const res = await $fetch<{ items: GbpReviewItem[]; nextPageToken?: string }>(
          '/api/gbp/reviews',
          {
            // acepta locationId, locationName o id (tu handler ya es tolerante)
            query: { locationId: id },
            credentials: 'include'
          }
        )
        reviews.value = res.items ?? []
        // average/total si en el futuro añades agregados en el handler
        average.value = null
        total.value = reviews.value.length
      } catch (e) {
        errorReviews.value = e
        reviews.value = []
        average.value = null
        total.value = null
      } finally {
        pendingReviews.value = false
      }
    },
    { immediate: true }
  )

  return {
    locationsRes,
    firstLocation,
    reviews,
    average,
    total,
    pendingReviews,
    errorReviews
  }
}