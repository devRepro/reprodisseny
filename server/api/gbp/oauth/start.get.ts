import { defineEventHandler, getQuery, setCookie, sendRedirect } from 'h3'
import { useRuntimeConfig } from '#imports'
import { getRequestURL } from 'h3' // disponible en h3

export default defineEventHandler((event) => {
  const { gbp } = useRuntimeConfig(event)
  const { returnTo = '/' } = getQuery(event) as { returnTo?: string }

  const safeReturnTo =
    typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//')
      ? returnTo
      : '/'

  const isProd = process.env.NODE_ENV === 'production'
  const state = crypto.randomUUID()

  // origin actual (http(s) + host + puerto)
  const origin = getRequestURL(event).origin
  const redirectUri = `${origin}/api/gbp/oauth/callback`

  // cookies para callback
  setCookie(event, 'gbp_oauth_state', state, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 300, secure: isProd
  })
  setCookie(event, 'gbp_return_to', safeReturnTo, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 600, secure: isProd
  })
  setCookie(event, 'gbp_redirect_uri', redirectUri, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 600, secure: isProd
  })

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', gbp.gbpClientId)
  url.searchParams.set('redirect_uri', redirectUri) // MISMO valor que guardamos
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'https://www.googleapis.com/auth/business.manage')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('include_granted_scopes', 'true')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('state', state)

  return sendRedirect(event, url.toString())
})
