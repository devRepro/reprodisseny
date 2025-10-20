// /server/api/gbp/oauth/callback.get.ts
import { getQuery, getCookie, deleteCookie, setCookie, sendRedirect, createError } from 'h3'
import { $fetch } from 'ofetch'
export default defineEventHandler(async (event) => {
  const { code, state } = getQuery(event)
  const expect = getCookie(event, 'gbp_oauth_state')
  if (!code || !state || state !== expect) throw createError({ statusCode: 400, statusMessage: 'OAuth state mismatch' })
  deleteCookie(event, 'gbp_oauth_state', { path: '/' })

  const returnTo = getCookie(event, 'gbp_return_to') || '/reviews'
  deleteCookie(event, 'gbp_return_to', { path: '/' })

  const { gbp } = useRuntimeConfig(event)
  const token = await $fetch<any>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: {
      code,
      client_id: gbp.gbpClientId,
      client_secret: gbp.gbpClientSecret,
      redirect_uri: gbp.gbpRedirectUri,
      grant_type: 'authorization_code'
    }
  })

  setCookie(event, 'gbp_access_token', token.access_token, {
    httpOnly: true, sameSite: 'lax', path: '/',
    maxAge: Math.max(0, (token.expires_in || 3600) - 60)
  })
  if (token.refresh_token) await useStorage().setItem('gbp:refresh_token', token.refresh_token)

  return sendRedirect(event, `${returnTo}?gbp=ok`)
})
