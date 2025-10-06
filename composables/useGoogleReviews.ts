// composables/useGoogleReviews.ts
import type { ReviewsResponseDTO } from '~/types/reviews'

export function useGoogleReviews (opts?: { lang?: string }) {
  const config = useRuntimeConfig()
  const placeId = config.public.gmapsPlaceId
  const lang = opts?.lang || 'es'

  // Tipamos el data del useFetch
  return useFetch<ReviewsResponseDTO>('/api/google/places/reviews', {
    params: { placeId, lang },
    server: false
  })
}
