import { getQuery, getCookie, setCookie, sendRedirect, createError } from 'h3'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const { code, state } = getQuery(event)
  const expect = getCookie(event, 'gbp_oauth_state')
  if (!code || !state || state !== expect) {
    throw createError({ statusCode: 400, statusMessage: 'OAuth state mismatch' })
  }

  const config = useRuntimeConfig()
  const token = await $fetch<any>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: {
      code,
      client_id: config.gbpClientId,
      client_secret: config.gbpClientSecret,
      redirect_uri: config.gbpRedirectUri,
      grant_type: 'authorization_code'
    }
  })

  // Access token para tus llamadas de servidor
  setCookie(event, 'gbp_access_token', token.access_token, {
    httpOnly: true, sameSite: 'lax', path: '/',
    maxAge: Math.max(0, (token.expires_in || 3600) - 60)
  })

  // (opcional) guarda refresh_token en almacenamiento del servidor
  if (token.refresh_token) {
    await useStorage().setItem('gbp:refresh_token', token.refresh_token)
  }

  return sendRedirect(event, '/panel?gbp=ok')
})
