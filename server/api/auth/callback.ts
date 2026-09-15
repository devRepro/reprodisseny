// server/api/auth/callback.get.ts

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

export default defineEventHandler(async (event) => {
  const code = getQuery(event).code as string
  const config = useRuntimeConfig()
  const clientId = String(config.googleClientId || "")
  const clientSecret = String(config.googleClientSecret || "")

  const tokenRes = await $fetch<GoogleTokenResponse>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: 'http://localhost:3000/api/auth/callback',
      grant_type: 'authorization_code'
    }).toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })

  const { access_token, refresh_token, expires_in = 0 } = tokenRes

  // ✅ Guardamos en caché segura (RAM + disco)
  const storage = useStorage()
  await storage.setItem('google/token', {
    access_token,
    refresh_token,
    expires_at: Date.now() + expires_in * 1000
  })

  return sendRedirect(event, '/panel') // tu panel privado
})
