import { sendRedirect, setCookie } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  // Anti-CSRF
  const state = Math.random().toString(36).slice(2)
  setCookie(event, 'gbp_oauth_state', state, { httpOnly: true, path: '/', maxAge: 300, sameSite: 'lax' })

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', config.gbpClientId)
  url.searchParams.set('redirect_uri', config.gbpRedirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'https://www.googleapis.com/auth/business.manage')
  url.searchParams.set('access_type', 'offline')        // para refresh_token
  url.searchParams.set('include_granted_scopes', 'true')
  url.searchParams.set('prompt', 'consent')             // fuerza refresh_token en dev
  url.searchParams.set('state', state)

  return sendRedirect(event, url.toString())
})
