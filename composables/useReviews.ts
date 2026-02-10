import { computed } from "vue"
import { usePlaceReviews } from "@/composables/usePlaceReviews"

export function useReviews(opts?: { placeId?: string; lang?: string; limit?: number }) {
  const config = useRuntimeConfig()

  const placeId =
    opts?.placeId ||
    (config.public?.googleMaps?.placeId as string | undefined) ||
    ""

  const lang = opts?.lang || "es"
  const limit = opts?.limit ?? 6

  if (!placeId) {
    // Error claro para dev
    const error = computed(() => new Error("Missing Google Place ID (runtimeConfig.public.googleMaps.placeId)"))
    return {
      source: "places" as const,
      items: computed(() => []),
      average: computed(() => 0),
      total: computed(() => 0),
      mapsUrl: computed(() => undefined),
      pending: computed(() => false),
      error,
      refresh: async () => {},
    }
  }

  const { items, average, total, mapsUrl, pending, error, refresh } = usePlaceReviews({
    placeId,
    lang,
    limit,
  })

  return { source: "places" as const, items, average, total, mapsUrl, pending, error, refresh }
}
