// /server/api/gbp/reviews.get.ts
import { getQuery, createError } from 'h3'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const locationId = typeof q.locationId === 'string' ? q.locationId : ''
  const pageToken = typeof q.pageToken === 'string' ? q.pageToken : undefined
  if (!locationId) throw createError({ statusCode: 400, statusMessage: 'locationId requerido' })

  const token = getCookie(event, 'gbp_access_token')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  const acc = await $fetch<{ accounts: { name: string }[] }>(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const account = acc.accounts?.[0]?.name
  if (!account) return { items: [], nextPageToken: undefined }

  const cleanId = locationId.includes('/') ? locationId.split('/')[1] : locationId
  const parent = `${account}/locations/${cleanId}`
  const url = new URL(`https://mybusiness.googleapis.com/v4/${parent}/reviews`)
  url.searchParams.set('pageSize', '50')
  url.searchParams.set('orderBy', 'updateTime desc')
  if (pageToken) url.searchParams.set('pageToken', pageToken)

  const res = await $fetch<any>(url.toString(), { headers: { Authorization: `Bearer ${token}` } })

  const items = (res.reviews || []).map((r: any) => ({
    id: r.reviewId || r.name,
    name: r.reviewer?.displayName || 'Usuario de Google',
    rating: ({ ONE:1, TWO:2, THREE:3, FOUR:4, FIVE:5 } as any)[r.starRating] || 0,
    comment: r.comment || '',
    reply: r.reviewReply?.comment || null,
    updateTime: r.updateTime
  }))
  return { items, nextPageToken: res.nextPageToken }
})
