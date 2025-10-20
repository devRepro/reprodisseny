// /server/api/gbp/oauth/login.get.ts
import { sendRedirect, setCookie, getQuery } from 'h3'
export default defineEventHandler((event) => {
  const { gbp } = useRuntimeConfig(event)
  const q = getQuery(event)
  const returnTo = typeof q.returnTo === 'string' ? q.returnTo : '/reviews'
  setCookie(event, 'gbp_return_to', returnTo, { httpOnly: true, path: '/', maxAge: 600, sameSite: 'lax' })

  const state = Math.random().toString(36).slice(2)
  setCookie(event, 'gbp_oauth_state', state, { httpOnly: true, path: '/', maxAge: 300, sameSite: 'lax' })

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', gbp.gbpClientId)
  url.searchParams.set('redirect_uri', gbp.gbpRedirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'https://www.googleapis.com/auth/business.manage')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('include_granted_scopes', 'true')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('state', state)

  return sendRedirect(event, url.toString())
})
