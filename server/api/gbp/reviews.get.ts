import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const { locationId } = getQuery(event) // Pasaremos el ID como: /api/gbp/reviews?locationId=locations/12345
  const accessToken = getCookie(event, 'gbp_access_token') // Obtener el token

  if (!locationId) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el ID de la ubicación (locationId)' })
  }
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  try {
    // La API para reseñas es mybusinessreviews
    // El `locationId` actúa como el "parent"
    const reviewsResponse: { reviews: any[] } = await $fetch(
      `https://mybusinessreviews.googleapis.com/v1/${locationId}/reviews`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    // Devolvemos solo la información que nos interesa para el frontend
    return reviewsResponse.reviews.map(review => ({
      name: review.reviewer.displayName,
      photoUrl: review.reviewer.profilePhotoUrl,
      rating: review.starRating, // "FIVE", "FOUR", etc.
      comment: review.comment,
      createTime: review.createTime,
      reply: review.reviewReply?.comment // La respuesta que diste, si existe
    }))

  } catch (error) {
    console.error('Error obteniendo reseñas:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al obtener las reseñas' })
  }
})