import { defineEventHandler, getQuery, setHeader, createError } from "h3"
import { useRuntimeConfig, useStorage } from "#imports"

/** ---- Tipos de la respuesta de Places (New) ---- */
interface PlaceReview {
  rating?: number
  text?: { text?: string }
  originalText?: { text?: string }
  authorAttribution?: {
    displayName?: string
    uri?: string
    photoUri?: string
  }
  publishTime?: string
  relativePublishTimeDescription?: string
}

interface PlaceDetailsResponse {
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  reviews?: PlaceReview[]
}

/** ---- DTO normalizado para tu front ---- */
interface ReviewDTO {
  rating: number
  text: string
  author: string
  profilePhotoUri?: string | null
  publishTime?: string
  relativeTime?: string
}

interface ReviewsResponseDTO {
  rating?: number
  userRatingCount?: number
  mapsUrl?: string
  reviews: ReadonlyArray<ReviewDTO>
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as {
    placeId?: string
    lang?: string
    limit?: string
    force?: string // force=1 ignora caché
  }

  const placeId = String(q.placeId || "").trim()
  const lang = String(q.lang || "es").trim()
  const limit = clampInt(q.limit, 6, 1, 10) // 1..10 (Places suele devolver pocas; limitamos payload)
  const force = q.force === "1"

  if (!placeId) {
    throw createError({ statusCode: 400, statusMessage: "Missing placeId" })
  }

  const { googleMaps } = useRuntimeConfig()
  const apiKey = googleMaps?.apiKey as string | undefined
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: "Missing GOOGLE_MAPS_API_KEY" })
  }

  // Cache navegador/CDN (6h) + SWR 24h
  setHeader(event, "Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400")

  // Cache server (Nitro)
  const storage = useStorage("cache")
  const CACHE_TTL_MS = 6 * 60 * 60 * 1000
  const cacheKey = `places:reviews:${placeId}:${lang}:limit=${limit}`
  const now = Date.now()

  if (!force) {
    const cached = await storage.getItem<{ ts: number; data: ReviewsResponseDTO }>(cacheKey)
    if (cached && now - cached.ts < CACHE_TTL_MS) return cached.data
  }

  const fieldMask = [
    "rating",
    "userRatingCount",
    "googleMapsUri",
    "reviews.rating",
    "reviews.text",
    "reviews.originalText",
    "reviews.authorAttribution",
    "reviews.publishTime",
    "reviews.relativePublishTimeDescription",
  ].join(",")

  const params = new URLSearchParams()
  if (lang) params.set("languageCode", lang)

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?${params.toString()}`

  try {
    const resp = await $fetch<PlaceDetailsResponse>(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
      timeout: 8000,
      retry: 1,
    })

    const reviews = (resp.reviews ?? []).slice(0, limit)

    const payload: ReviewsResponseDTO = {
      rating: resp.rating,
      userRatingCount: resp.userRatingCount,
      mapsUrl: resp.googleMapsUri,
      reviews: reviews.map((r): ReviewDTO => ({
        rating: r.rating ?? 0,
        text: r.text?.text || r.originalText?.text || "",
        author: r.authorAttribution?.displayName || "Usuario de Google",
        profilePhotoUri: r.authorAttribution?.photoUri || null,
        publishTime: r.publishTime,
        relativeTime: r.relativePublishTimeDescription,
      })),
    }

    await storage.setItem(cacheKey, { ts: now, data: payload })
    return payload
  } catch (e: any) {
    // Fallback a caché stale si existe (mejor UX y SEO que “romper” la home)
    const stale = await storage.getItem<{ ts: number; data: ReviewsResponseDTO }>(cacheKey)
    if (stale?.data) return stale.data

    const status = e?.response?.status || e?.statusCode || 502
    const msg =
      status === 403 || status === 401
        ? "Google Places auth error (API key / billing / restrictions)"
        : status === 400
          ? "Google Places bad request (placeId / params)"
          : "Places upstream error"

    throw createError({ statusCode: status, statusMessage: msg })
  }
})

function clampInt(v: unknown, fallback: number, min: number, max: number) {
  const n = parseInt(String(v ?? ""), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}
