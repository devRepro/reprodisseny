import { defineEventHandler, getQuery, setHeader, createError } from "h3"
import { useRuntimeConfig, useStorage } from "#imports"
import { fetchWithBackoff } from "~/server/utils/googleFetch.server"

interface PlaceReview {
  rating?: number
  text?: { text?: string }
  originalText?: { text?: string }
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string }
  publishTime?: string
  relativePublishTimeDescription?: string
}
interface PlaceDetailsResponse {
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  reviews?: PlaceReview[]
}

type ReviewDTO = {
  rating: number
  text: string
  author: string
  profilePhotoUri: string | null
  publishTime?: string
  relativeTime?: string
}

type ReviewsResponseDTO = {
  rating?: number
  userRatingCount?: number
  mapsUrl?: string
  reviews: ReadonlyArray<ReviewDTO>
}

function clampInt(v: unknown, fallback: number, min: number, max: number) {
  const n = parseInt(String(v ?? ""), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

function normalizePlaceId(raw: string) {
  // Accept: "ChIJ..." | "places/ChIJ..." | " places/ChIJ... "
  return String(raw || "").trim().replace(/^places\//, "")
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as {
    placeId?: string
    lang?: string
    limit?: string
    force?: string
  }

  const placeId = normalizePlaceId(q.placeId || "")
  const lang = String(q.lang || "es").trim()
  const limit = clampInt(q.limit, 6, 1, 10)
  const force = q.force === "1"

  if (!placeId) throw createError({ statusCode: 400, statusMessage: "Missing placeId" })

  const { googleMaps } = useRuntimeConfig()
  const apiKey = googleMaps?.apiKey as string | undefined
  if (!apiKey) throw createError({ statusCode: 500, statusMessage: "Missing GOOGLE_MAPS_API_KEY" })

  // Cache navegador/CDN (6h) + SWR 24h
  setHeader(event, "Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400")

  // Cache Nitro
  const storage = useStorage("cache")
  const cacheKey = `places:reviews:${placeId}:${lang}:limit=${limit}`
  const now = Date.now()

  const SUCCESS_TTL_MS = 6 * 60 * 60 * 1000
  const EMPTY_TTL_MS = 10 * 60 * 1000 // ✅ si no hay reseñas, reintenta antes (10 min)

  if (!force) {
    const cached = await storage.getItem<{ ts: number; ttl: number; data: ReviewsResponseDTO }>(cacheKey)
    if (cached && now - cached.ts < cached.ttl) return cached.data
  }

  const fieldMask = [
    "id",
    "displayName",
    "rating",
    "userRatingCount",
    "googleMapsUri",
    "reviews",
  ].join(",")
  

  const params = new URLSearchParams()
  if (lang) params.set("languageCode", lang)
  params.set("regionCode", "ES")

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?${params.toString()}`

  try {
    const resp = await fetchWithBackoff<PlaceDetailsResponse>(
      url,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": fieldMask,
        },
        timeout: 8000,
      },
      { retries: 3, baseDelay: 400, maxDelay: 6000 }
    )

    const reviews = (resp.reviews ?? []).slice(0, limit)

    const payload: ReviewsResponseDTO = {
      rating: resp.rating,
      userRatingCount: resp.userRatingCount,
      mapsUrl: resp.googleMapsUri,
      reviews: reviews
        .map((r) => ({
          rating: r.rating ?? 0,
          text: r.text?.text || r.originalText?.text || "",
          author: r.authorAttribution?.displayName || "Usuario de Google",
          profilePhotoUri: r.authorAttribution?.photoUri || null,
          publishTime: r.publishTime,
          relativeTime: r.relativePublishTimeDescription,
        }))
        // ✅ filtra “reseñas” vacías
        .filter((r) => r.rating > 0 || r.text.length > 0),
    }

    const ttl = (payload.userRatingCount ?? 0) > 0 ? SUCCESS_TTL_MS : EMPTY_TTL_MS
    await storage.setItem(cacheKey, { ts: now, ttl, data: payload })

    return payload
  } catch (e: any) {
    const status = e?.response?.status || e?.status || e?.statusCode || 502
    const body = e?.data || e?.response?._data

    console.error("Places error", { status, url, body })

    // Fallback a caché stale si existe
    const stale = await storage.getItem<{ ts: number; ttl: number; data: ReviewsResponseDTO }>(cacheKey)
    if (stale?.data) return stale.data

    const msg =
      status === 403 || status === 401
        ? "Google Places auth error (API key / billing / restrictions)"
        : status === 404
          ? "Google Places NOT_FOUND (placeId incorrecto/obsoleto)"
          : status === 400
            ? "Google Places bad request (placeId / FieldMask / params)"
            : "Places upstream error"

    throw createError({ statusCode: status, statusMessage: msg })
  }
})
