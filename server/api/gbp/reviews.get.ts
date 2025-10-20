
// server/api/gbp/reviews.get.ts
import { getCookie, getQuery, createError } from 'h3'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'gbp_access_token')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  // 1. Obtener locationId y pageToken desde la query
  const { locationId, pageToken } = getQuery(event)
  if (!locationId || typeof locationId !== 'string' || !locationId.startsWith('accounts/')) {
    throw createError({ statusCode: 400, statusMessage: 'Falta parámetro locationId válido (ej: accounts/123/locations/456)' })
  }

  // 2. Construir la URL con paginación
  const params = new URLSearchParams({
    pageSize: '25', // Puedes ajustar esto
    orderBy: 'updateTime desc'
  })
  if (pageToken) {
    params.set('pageToken', pageToken as string)
  }

  const url = `https://mybusiness.googleapis.com/v4/${locationId}/reviews?${params.toString()}`

  try {
    // 3. Llamar a la API v4 de My Business
    const res = await $fetch<any>(url, { 
      headers: { Authorization: `Bearer ${token}` } 
    })

    // 4. Devolver los datos normalizados y el token para la siguiente página
    return {
      averageRating: res.averageRating,
      total: res.totalReviewCount,
      // Importante: token para cargar la siguiente página
      nextPageToken: res.nextPageToken || null, 
      items: (res.reviews || []).map((r: any) => ({
        id: r.reviewId,
        name: r.reviewer?.displayName || (r.reviewer?.isAnonymous ? 'Usuario de Google' : '—'),
        rating: r.starRating,
        comment: r.comment || '',
        createdAt: r.createTime,
        reply: r.reviewReply?.comment || ''
      }))
    }
  } catch (err: any) {
    // Manejar errores comunes de la API
    console.error('Error al obtener reseñas de GBP:', err.data)
    throw createError({ 
      statusCode: err?.status || 500, 
      statusMessage: `Error de Google API: ${err.data?.error?.message || 'Error desconocido'}` 
    })
  }
})