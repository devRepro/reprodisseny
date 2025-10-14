// composables/useGoogleReviews.ts
type RawReview = {
  author_name: string
  profile_photo_url?: string
  author_url?: string
  rating: number
  relative_time_description?: string
  text?: string
  time?: number | string
}

type ServerResponse = {
  rating: number | null
  total: number
  reviews: RawReview[]
}

type UiReview = {
  author: string
  authorUrl?: string
  profilePhotoUri?: string
  rating: number
  relativeTime?: string
  text?: string
}

type UiPayload = {
  rating: number | null
  total: number
  reviews: UiReview[]
}

export function useGoogleReviews(opts?: { lang?: string }) {
  const lang = opts?.lang ?? 'es'

  // Ojo: NO caches servidor a largo plazo (Places limita el caché).
  // Esto solo cachea por página/navegación en el cliente.
  const { data, pending, error, refresh } = useFetch<ServerResponse, UiPayload>(
    '/api/google/reviews',
    {
      key: `google-reviews:${lang}`,
      query: { lang },
      transform: (r) => ({
        rating: r.rating,
        total: r.total,
        reviews: (r.reviews ?? []).map((it) => ({
          author: it.author_name,
          authorUrl: it.author_url,
          profilePhotoUri: it.profile_photo_url,
          rating: Number(it.rating ?? 0),
          relativeTime: it.relative_time_description,
          text: it.text ?? ''
        }))
      })
    }
  )

  return { data, pending, error, refresh }
}
