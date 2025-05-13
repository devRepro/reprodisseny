// server/api/auth/callback.get.ts
import { navigateTo } from '#app'

export default defineEventHandler(async (event) => {
  const code = getQuery(event).code as string
  const config = useRuntimeConfig()

  const tokenRes = await $fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      code,
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      redirect_uri: 'http://localhost:3000/api/auth/callback',
      grant_type: 'authorization_code'
    }).toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })

  const { access_token, refresh_token, expires_in } = tokenRes as any

  // ✅ Guardamos en caché segura (RAM + disco)
  const storage = useStorage()
  await storage.setItem('google/token', {
    access_token,
    refresh_token,
    expires_at: Date.now() + expires_in * 1000
  })

  return sendRedirect(event, '/panel') // tu panel privado
})
