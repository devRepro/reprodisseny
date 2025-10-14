// composables/useGbpReviews.ts
import type { UiReview } from '~/types/gbp'

export function useGbpReviews() {
  return useFetch<{
    count: number
    averageRating: number
    reviews: UiReview[]
    fetchedAt: number
  }>('/api/gbp/reviews', {
    key: 'gbp-reviews',
    default: () => ({ count: 0, averageRating: 0, reviews: [], fetchedAt: 0 }),
    server: true
  })
}
