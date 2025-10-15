// server/api/gbp/oauth/login.get.ts
export default defineEventHandler((event) => {
  const { gbp } = useRuntimeConfig()
  const p = new URLSearchParams({
    client_id: gbp.clientId,
    redirect_uri: gbp.redirectUri,
    response_type: 'code',
    access_type: 'offline',     // ← Crucial para el refresh_token
    prompt: 'consent',          // ← Asegura que siempre se pida consentimiento y se emita un refresh_token
    scope: 'https://www.googleapis.com/auth/business.manage'
  })
  return sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${p}`, 302)
})
