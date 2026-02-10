import { computed } from "vue"
import type { ReviewsQuery, ReviewsResponseDTO, ReviewDTO, ReviewCardItem } from "@/types/reviews"

export function usePlaceReviews(query: ReviewsQuery & { limit?: number }) {
  const placeId = String(query.placeId || "").trim()
  const lang = query.lang || "es"
  const limit = query.limit ?? 6

  const key = `place-reviews:${placeId}:${lang}:limit=${limit}`

  const { data, pending, error, refresh } = useFetch<ReviewsResponseDTO>(
    "/api/google/places/reviews",
    {
      params: { placeId, lang, limit },
      key,
      // SSR by default in Nuxt; lo dejamos explícito por claridad
      server: true,
    }
  )

  const items = computed<ReviewCardItem[]>(() =>
    (data.value?.reviews ?? []).map((r: ReviewDTO, i) => ({
      id: `${placeId}:${i}`,
      author: r.author || "Usuario de Google",
      rating: r.rating || 0,
      text: r.text || "",
      // UX estable: preferimos relativeTime del API (ya viene localizado)
      time: r.relativeTime || (r.publishTime ? toYMD(r.publishTime) : ""),
      avatar: r.profilePhotoUri ?? null,
      url: undefined,
    }))
  )

  const average = computed(() => data.value?.rating ?? 0)
  const total = computed(() => data.value?.userRatingCount ?? items.value.length)
  const mapsUrl = computed(() => data.value?.mapsUrl)

  return { data, items, average, total, mapsUrl, pending, error, refresh }
}

function toYMD(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
