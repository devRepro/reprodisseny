// server/api/gbp/reviews.get.ts
import { getCookie, createError } from 'h3'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'gbp_access_token')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  const config = useRuntimeConfig()
  const location = config.gbpLocation  // ponlo en .env para evitar listar
  if (!location) throw createError({ statusCode: 400, statusMessage: 'Falta NUXT_GBP_LOCATION' })

  const url = `https://mybusiness.googleapis.com/v4/${location}/reviews?pageSize=25&orderBy=updateTime%20desc`
  const res = await $fetch<any>(url, { headers: { Authorization: `Bearer ${token}` } })

  return {
    averageRating: res.averageRating,
    total: res.totalReviewCount,
    items: (res.reviews || []).map((r:any) => ({
      id: r.reviewId,
      name: r.reviewer?.displayName || (r.reviewer?.isAnonymous ? 'Usuario de Google' : '—'),
      rating: r.starRating,
      comment: r.comment || '',
      createdAt: r.createTime,
      reply: r.reviewReply?.comment || ''
    }))
  }
})

