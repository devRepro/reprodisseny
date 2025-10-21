import { defineEventHandler, getQuery, getCookie, deleteCookie, setCookie, sendRedirect, createError } from 'h3'
import { useRuntimeConfig, useStorage } from '#imports'

export default defineEventHandler(async (event) => {
  const { code, state, error: oauthError, error_description } = getQuery(event) as Record<string, string | undefined>
  if (oauthError) return sendRedirect(event, `/login?error=${encodeURIComponent(oauthError)}&desc=${encodeURIComponent(error_description || '')}`)

  const expect = getCookie(event, 'gbp_oauth_state')
  if (!code || !state || state !== expect) throw createError({ statusCode: 400, statusMessage: 'OAuth state mismatch' })
  deleteCookie(event, 'gbp_oauth_state', { path: '/' })

  const rawReturnTo = getCookie(event, 'gbp_return_to') || '/reviews'
  deleteCookie(event, 'gbp_return_to', { path: '/' })
  const safeReturnTo =
    typeof rawReturnTo === 'string' && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')
      ? rawReturnTo
      : '/'

  // Usa el MISMO redirect_uri que se usó en start
  const redirectUri = getCookie(event, 'gbp_redirect_uri')
  deleteCookie(event, 'gbp_redirect_uri', { path: '/' })

  const { gbp } = useRuntimeConfig(event)
  const body = new URLSearchParams({
    code,
    client_id: gbp.gbpClientId,
    client_secret: gbp.gbpClientSecret,
    redirect_uri: redirectUri || gbp.gbpRedirectUri, // fallback por si acaso
    grant_type: 'authorization_code',
  })

  const token = await $fetch<any>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const isProd = process.env.NODE_ENV === 'production'
  setCookie(event, 'gbp_access_token', token.access_token, {
    httpOnly: true, sameSite: 'lax', secure: isProd, path: '/',
    maxAge: Math.max(0, (token.expires_in || 3600) - 60),
  })
  if (token.refresh_token) await useStorage().setItem('gbp:refresh_token', token.refresh_token)

  const sep = safeReturnTo.includes('?') ? '&' : '?'
  return sendRedirect(event, `${safeReturnTo}${sep}gbp=ok`)
})
