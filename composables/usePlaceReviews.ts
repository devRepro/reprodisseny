import { computed } from "vue"
import type { ReviewsQuery, ReviewsResponseDTO, ReviewDTO, ReviewCardItem } from "@/types/reviews"

export function usePlaceReviews(queryIn?: ReviewsQuery & { limit?: number }) {
  const config = useRuntimeConfig()

  const placeId = String(queryIn?.placeId || config.public.googleMaps.placeId || "").trim()
  const lang = String(queryIn?.lang || "es").trim()
  const limit = queryIn?.limit ?? 6

  const key = `place-reviews:${placeId}:${lang}:limit=${limit}`

  // Si falta placeId, devolvemos una forma estable (sin peticiones)
  if (!placeId) {
    const emptyItems = computed<ReviewCardItem[]>(() => [])
    return {
      data: computed(() => undefined),
      items: emptyItems,
      average: computed(() => 0),
      total: computed(() => 0),
      mapsUrl: computed(() => undefined as string | undefined),
      pending: computed(() => false),
      error: computed(() => new Error("Missing Google Place ID (runtimeConfig.public.googleMaps.placeId)")),
      refresh: async () => {},
    }
  }

  const { data, pending, error, refresh } = useFetch<ReviewsResponseDTO>("/api/places/reviews", {
    key,
    query: { placeId, lang, limit }, // ✅ query (no params)
    server: true,
  })

  const items = computed<ReviewCardItem[]>(() =>
    (data.value?.reviews ?? []).map((r: ReviewDTO, i) => ({
      id: `${placeId}:${i}`,
      author: r.author || "Usuario de Google",
      rating: r.rating || 0,
      text: r.text || "",
      time: r.relativeTime || (r.publishTime ? toYMD(r.publishTime) : ""),
      avatar: r.profilePhotoUri ?? null,
      url: data.value?.mapsUrl, // útil si quieres enlazar “Ver en Google”
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
