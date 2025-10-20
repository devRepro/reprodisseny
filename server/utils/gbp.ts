// /server/utils/gbp.ts
import { getCookie, setCookie, createError } from 'h3'
import { $fetch } from 'ofetch'

export async function getAccessTokenOrRefresh(event) {
  let access = getCookie(event, 'gbp_access_token')
  if (access) return access

  const { gbp } = useRuntimeConfig(event)
  const refresh = await useStorage().getItem<string>('gbp:refresh_token')
  if (!refresh) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  const token = await $fetch<any>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: {
      client_id: gbp.gbpClientId,
      client_secret: gbp.gbpClientSecret,
      refresh_token: refresh,
      grant_type: 'refresh_token'
    }
  })

  access = token.access_token
  setCookie(event, 'gbp_access_token', access, {
    httpOnly: true, sameSite: 'lax', path: '/',
    maxAge: Math.max(0, (token.expires_in || 3600) - 60)
  })
  return access
}

export async function gbpFetch<T>(event, url: string, opts: any = {}) {
  const token = await getAccessTokenOrRefresh(event)
  return $fetch<T>(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` } })
}
