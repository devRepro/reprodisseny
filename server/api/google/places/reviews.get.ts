import { defineEventHandler, getQuery, setHeader, createError } from 'h3'
import { useRuntimeConfig, useStorage } from '#imports'

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

/** ---- Tus DTOs normalizados ---- */
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
  const { placeId, lang = 'es', force } = getQuery(event) as {
    placeId?: string
    lang?: string
    force?: string // si force=1, ignora caché
  }

  if (!placeId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing placeId' })
  }

  // Cache navegadores/CDN (6 h) + SWR 24 h
  setHeader(event, 'Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400')

  const { googleMaps } = useRuntimeConfig()
  const apiKey = googleMaps?.apiKey as string | undefined
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Missing GOOGLE_MAPS_API_KEY' })
  }

  // ---- Cache de servidor (Nitro Storage) ----
  const storage = useStorage('cache')
  const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6h
  const cacheKey = `places:reviews:${placeId}:${lang}`
  const now = Date.now()

  if (force !== '1') {
    const cached = await storage.getItem<{ ts: number; data: ReviewsResponseDTO }>(cacheKey)
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      return cached.data
    }
  }

  // ---- FieldMask obligatorio en Places (New) ----
  // Pedimos solo lo necesario (reduce coste/latencia)
  const fieldMask = [
    'rating',
    'userRatingCount',
    'googleMapsUri',
    'reviews.rating',
    'reviews.text',
    'reviews.originalText',
    'reviews.authorAttribution',
    'reviews.publishTime',
    'reviews.relativePublishTimeDescription'
  ].join(',')

  const params = new URLSearchParams()
  if (lang) params.set('languageCode', lang)
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?${params.toString()}`

  try {
    const resp = await $fetch<PlaceDetailsResponse>(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,       // clave privada del server
        'X-Goog-FieldMask': fieldMask   // obligatorio en Places (New)
      }
    })

    const payload: ReviewsResponseDTO = {
      rating: resp.rating,
      userRatingCount: resp.userRatingCount,
      mapsUrl: resp.googleMapsUri,
      reviews: (resp.reviews ?? []).map((r): ReviewDTO => ({
        rating: r.rating ?? 0,
        text: r.text?.text || r.originalText?.text || '',
        author: r.authorAttribution?.displayName || 'Usuario de Google',
        profilePhotoUri: r.authorAttribution?.photoUri || null,
        publishTime: r.publishTime,
        relativeTime: r.relativePublishTimeDescription
      }))
    }

    await storage.setItem(cacheKey, { ts: now, data: payload })
    return payload
  } catch (e: any) {
    // Si Google falla, servimos caché "stale" si existe
    const stale = await storage.getItem<{ ts: number; data: ReviewsResponseDTO }>(cacheKey)
    if (stale?.data) return stale.data

    // Propaga error con contexto
    throw createError({
      statusCode: e?.statusCode || 502,
      statusMessage: e?.statusMessage || 'Places upstream error'
    })
  }
})
