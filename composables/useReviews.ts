// composables/useReviews.ts (solo el bloque 'gbp')
import { computed } from 'vue'
import { useGoogleReviews } from '@/composables/useGoogleReviews'

export function useReviews(opts: { source?: 'gbp' | 'places'; placeId?: string; lang?: string }) {
  const source = opts.source ?? (process.dev ? 'gbp' : 'places')


  if (source === 'places') {
    const { items, average, total, pending, error, refresh } =
      usePlaceReviews({ placeId: opts.placeId!, lang: opts.lang || 'es' })
    return { items, average, total, pending, error, refresh, source }
  }

  const { reviews, average, total, pendingReviews, errorReviews } = useGoogleReviews()

  const items = computed<ReviewCardItem[]>(() =>
    (reviews.value ?? []).map((r: any, i: number) => ({
      id: r.reviewId ?? `gbp:${i}`,
      author: r.author ?? r.reviewer?.displayName ?? 'Usuario de Google',
      rating: r.rating ?? r.starRating ?? 0,
      text: r.text ?? r.comment ?? '',
      time: r.time ?? r.updateTime ?? '',
      avatar: r.avatar ?? r.reviewer?.profilePhotoUrl ?? null,
      url: r.url
    }))
  )
  const pending = computed(() => pendingReviews.value)
  const error = computed(() => errorReviews.value)
  return { items, average, total, pending, error, source }
}
