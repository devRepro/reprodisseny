// composables/useGoogleReviews.ts
import type { UiLocation, UiReview } from '~/types/gbp'

export function useGoogleReviews() {
  const locationsRes = useFetch<{ locations: UiLocation[] }>('/api/gbp/locations', {
    server: false,           // solo cliente (usas cookie)
    credentials: 'include',
    key: 'gbp-locations-client'
  })

  const firstLocation = computed(() => locationsRes.data.value?.locations?.[0])

  const reviews = ref<UiReview[]>([])
  const pendingReviews = ref(false)
  const errorReviews = ref<unknown>(null)

  watchEffect(async () => {
    const loc = firstLocation.value
    if (!loc?.id) return
    pendingReviews.value = true
    errorReviews.value = null
    try {
      const res = await $fetch<{ reviews: UiReview[]; averageRating?: number; totalReviewCount?: number }>(
        '/api/gbp/reviews',
        {
          query: { locationName: loc.id }, // "accounts/.../locations/..."
          credentials: 'include'
        }
      )
      reviews.value = res.reviews
    } catch (e) {
      errorReviews.value = e
      reviews.value = []
    } finally {
      pendingReviews.value = false
    }
  })

  return {
    // ubicaciones
    locationsRes,
    firstLocation,
    // reseñas
    reviews,
    pendingReviews,
    errorReviews
  }
}
