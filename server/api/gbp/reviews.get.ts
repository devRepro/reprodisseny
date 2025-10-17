import { getCookie, createError, getQuery } from 'h3'
import { fetchWithBackoff } from '~/server/utils/googleFetch'

type StarRating = 'ONE'|'TWO'|'THREE'|'FOUR'|'FIVE'
const starToNumber = (s?: StarRating) => s==='FIVE'?5:s==='FOUR'?4:s==='THREE'?3:s==='TWO'?2:s==='ONE'?1:0

export default defineCachedEventHandler(async (event) => {
  const accessToken = getCookie(event, 'gbp_access_token')
  if (!accessToken) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  const { locationName } = getQuery(event) as { locationName?: string }
  if (!locationName || !/^accounts\/[^/]+\/locations\/[^/]+$/.test(locationName)) {
    throw createError({ statusCode: 400, statusMessage: 'Parámetro locationName inválido' })
  }

  const headers = { Authorization: `Bearer ${accessToken}` }
  const base = `https://mybusiness.googleapis.com/v4/${locationName}/reviews`

  const reviews: any[] = []
  let pageToken: string | undefined
  let averageRating: number | undefined
  let totalReviewCount = 0

  do {
    const url = `${base}?pageSize=100${pageToken ? `&pageToken=${pageToken}` : ''}`
    const res = await fetchWithBackoff<any>(url, { headers })
    reviews.push(...(res.reviews ?? []))
    pageToken = res.nextPageToken
    if (typeof res.averageRating === 'number') averageRating = res.averageRating
    if (typeof res.totalReviewCount === 'number') totalReviewCount = res.totalReviewCount
  } while (pageToken)

  const ui = reviews.map((r: any) => ({
    author: r.reviewer?.displayName || (r.reviewer?.isAnonymous ? 'Usuario de Google' : 'Cliente'),
    avatar: r.reviewer?.profilePhotoUrl,
    rating: starToNumber(r.starRating as StarRating),
    text: r.comment ?? '',
    time: r.createTime,
    reply: r.reviewReply?.comment
  }))

  return { reviews: ui, averageRating, totalReviewCount }
}, {
  maxAge: 60 * 5,  // cache breve para no spamear la API al navegar/recargar
  swr: true,
  varies: ['cookie']
})

