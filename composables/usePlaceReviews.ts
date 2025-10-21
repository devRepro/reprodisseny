import { computed } from 'vue'
import type { ReviewsQuery, ReviewsResponseDTO, ReviewDTO, ReviewCardItem } from '@/types/reviews'

export function usePlaceReviews(query: ReviewsQuery) {
  const key = `place-reviews:${query.placeId}:${query.lang || 'es'}`
  const { data, pending, error, refresh } = useFetch<ReviewsResponseDTO>(
    '/api/google/places/reviews',
    { params: query, key }
  )

  const items = computed<ReviewCardItem[]>(() =>
    (data.value?.reviews ?? []).map((r: ReviewDTO, i) => ({
      id: `${query.placeId}:${i}`,
      author: r.author || 'Usuario de Google',
      rating: r.rating || 0,
      text: r.text || '',
      time: r.relativeTime || (r.publishTime ? toYMD(r.publishTime) : ''),
      avatar: r.profilePhotoUri ?? null,
      url: undefined
    }))
  )

  const average = computed(() => data.value?.rating ?? 0)
  const total = computed(() => data.value?.userRatingCount ?? items.value.length)

  return { data, items, average, total, pending, error, refresh }
}

function toYMD(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
