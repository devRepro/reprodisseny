// /server/api/gbp/locations.get.ts
import { $fetch } from 'ofetch'
import { getCookie, setCookie, createError } from 'h3'

async function getAccessTokenOrRefresh(event) {
  let access = getCookie(event, 'gbp_access_token')
  if (access) return access
  const { gbp } = useRuntimeConfig(event)
  const refresh = await useStorage().getItem<string>('gbp:refresh_token')
  if (!refresh) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  const token = await $fetch<any>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: { client_id: gbp.gbpClientId, client_secret: gbp.gbpClientSecret, refresh_token: refresh, grant_type: 'refresh_token' }
  })
  access = token.access_token
  setCookie(event, 'gbp_access_token', access, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: (token.expires_in || 3600) - 60 })
  return access
}

export default defineEventHandler(async (event) => {
  const token = await getAccessTokenOrRefresh(event)
  const acc = await $fetch<{ accounts: { name: string }[] }>(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    { headers: { Authorization: `Bearer ${token}` } }
  ) // lista cuentas
  const account = acc.accounts?.[0]?.name
  if (!account) return { locations: [] }

  const all: any[] = []
  let pageToken: string | undefined
  do {
    const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${account}/locations`)
    url.searchParams.set('readMask', 'name,title')
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    const res = await $fetch<any>(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
    all.push(...(res.locations || []))
    pageToken = res.nextPageToken
  } while (pageToken)

  const locations = all.map((l: any) => {
    const raw = String(l.name) // "locations/XXXX"
    return { id: raw.split('/')[1] || raw, title: l.title }
  })
  return { account, locations }
})

