// server/api/google-reviews.get.ts
export default defineEventHandler(async (event) => {
  const storage = useStorage()
  const tokenData = await storage.getItem<{ access_token: string, expires_at: number }>('google/token')
  if (!tokenData) return createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  // Verificar expiración simple
  if (Date.now() > tokenData.expires_at) {
    return createError({ statusCode: 401, statusMessage: 'Token expired' })
  }

  // ✅ Revisamos si ya está cacheada la respuesta
  const cacheKey = 'google/reviews'
  const cached = await storage.getItem(cacheKey)
  if (cached) return cached

  const locationId = 'YOUR_LOCATION_ID' // ← puedes obtenerlo vía API

  const data = await $fetch(`https://mybusiness.googleapis.com/v4/accounts/YOUR_ACCOUNT_ID/locations/${locationId}/reviews`, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  })

  // Cache por 1 hora
  await storage.setItem(cacheKey, data, { ttl: 3600 })

  return data
})
