// /server/api/gbp/reviews.get.ts
import {
  defineEventHandler, getQuery, createError,
  getCookie, setCookie
} from 'h3'
import { $fetch } from 'ofetch'
import { useRuntimeConfig, useStorage } from '#imports'

type GbpReview = {
  reviewId?: string
  name?: string
  starRating?: 'ONE'|'TWO'|'THREE'|'FOUR'|'FIVE'
  comment?: string
  reviewer?: { displayName?: string }
  reviewReply?: { comment?: string }
  updateTime?: string
}

function normalizeLocation(q: Record<string, any>): { parentPath: string } {
  // Admite: locationName=accounts/.../locations/123,  locationId=locations/123,  id=123
  const raw = (typeof q.locationName === 'string' && q.locationName) ||
              (typeof q.locationId === 'string'   && q.locationId)   ||
              (typeof q.id === 'string'           && q.id)           || ''

  if (!raw) throw createError({ statusCode: 400, statusMessage: 'locationId/locationName requerido' })

  // Si viene completo con accounts/.../locations/..., úsalo tal cual (sin trailing /reviews)
  if (raw.includes('accounts/') && raw.includes('/locations/')) {
    const parent = raw.split('/reviews')[0] // por si alguien pasa el nombre de la review
    return { parentPath: parent }
  }

  // Si viene tipo locations/123 o solo 123, construimos con accounts/me
  const locId = raw.includes('locations/') ? raw.split('locations/')[1] : raw
  if (!locId) throw createError({ statusCode: 400, statusMessage: 'locationId inválido' })
  return { parentPath: `accounts/me/locations/${encodeURIComponent(locId)}` }
}

function mapRating(star?: GbpReview['starRating']): number {
  const map: Record<string, number> = { ONE:1, TWO:2, THREE:3, FOUR:4, FIVE:5 }
  return star ? (map[star] || 0) : 0
}

async function refreshAccessToken(): Promise<string | null> {
  const storage = useStorage()
  const refresh = await storage.getItem<string>('gbp:refresh_token')
  if (!refresh) return null

  const { gbp } = useRuntimeConfig()
  try {
    const body = new URLSearchParams({
      refresh_token: refresh,
      client_id: gbp.gbpClientId,
      client_secret: gbp.gbpClientSecret,
      grant_type: 'refresh_token'
    })
    const resp = await $fetch<{ access_token: string; expires_in?: number }>(
      'https://oauth2.googleapis.com/token',
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }
    )
    // Devuelve el nuevo access token; el caller decide si reintenta
    return resp.access_token || null
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as Record<string, any>
  const { parentPath } = normalizeLocation(q)

  // Paginación y orden
  const pageToken = typeof q.pageToken === 'string' ? q.pageToken : undefined
  const pageSizeNum = Math.min(Math.max(parseInt(q.pageSize as string, 10) || 50, 1), 50) // 1..50

  // Token de acceso (cookie httpOnly)
  let accessToken = getCookie(event, 'gbp_access_token')
  if (!accessToken) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  const buildUrl = (parent: string) => {
    const url = new URL(`https://mybusiness.googleapis.com/v4/${parent}/reviews`)
    url.searchParams.set('pageSize', String(pageSizeNum))
    url.searchParams.set('orderBy', 'updateTime desc')
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    return url.toString()
  }

  const doFetch = async (token: string) => $fetch<{ reviews?: GbpReview[]; nextPageToken?: string }>(
    buildUrl(parentPath),
    { headers: { Authorization: `Bearer ${token}` } }
  )

  let res: { reviews?: GbpReview[]; nextPageToken?: string }
  try {
    res = await doFetch(accessToken)
  } catch (e: any) {
    // Si expira el token, intenta refresh una vez
    const status = e?.status || e?.response?.status
    if (status === 401) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        accessToken = newToken
        // re-graba cookie (respeta prod/dev)
        const isProd = process.env.NODE_ENV === 'production'
        setCookie(event, 'gbp_access_token', newToken, {
          httpOnly: true, sameSite: 'lax', secure: isProd, path: '/',
          maxAge: 3500 // ~1h menos margen
        })
        res = await doFetch(newToken)
      } else {
        throw createError({ statusCode: 401, statusMessage: 'Sesión expirada: vuelve a conectar Google' })
      }
    } else {
      // Propaga error de upstream
      throw createError({ statusCode: status || 502, statusMessage: 'GBP upstream error' })
    }
  }

  const items = (res.reviews ?? []).map(r => ({
    id: r.reviewId || r.name,
    name: r.reviewer?.displayName || 'Usuario de Google',
    rating: mapRating(r.starRating),
    comment: r.comment || '',
    reply: r.reviewReply?.comment || null,
    updateTime: r.updateTime
  }))

  return { items, nextPageToken: res.nextPageToken }
})
