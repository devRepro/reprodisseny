// server/utils/graph.ts
import { ofetch } from 'ofetch'
import { createError } from 'h3'
import { useRuntimeConfig } from '#imports'

type MsCfg = {
  tenantId: string
  clientId: string
  clientSecret: string
  siteId?: string
  siteHostname?: string
  sitePath?: string
  listId?: string
  listDisplayName?: string
}

function getMs(event?: any): MsCfg {
  const { ms } = useRuntimeConfig(event) as { ms: MsCfg }
  const missing = [
    ['tenantId', ms.tenantId],
    ['clientId', ms.clientId],
    ['clientSecret', ms.clientSecret],
    // o bien siteId, o bien hostname+path
    ['site', ms.siteId || (ms.siteHostname && ms.sitePath) ? 'ok' : ''],
    // o bien listId, o bien displayName
    ['list', ms.listId || ms.listDisplayName ? 'ok' : '']
  ].filter(([,v]) => !v).map(([k]) => k)
  if (missing.length) {
    throw createError({ statusCode: 500, statusMessage: `Faltan credenciales MS: ${missing.join(', ')}` })
  }
  return ms
}

const cache: { token?: string; exp?: number; siteId?: string; listId?: string } = {}

export async function getGraphToken(event?: any): Promise<string> {
  const { tenantId, clientId, clientSecret } = getMs(event)
  const now = Math.floor(Date.now()/1000)
  if (cache.token && cache.exp && cache.exp - 60 > now) return cache.token
  const res = await ofetch<{ access_token: string; expires_in: number }>(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'https://graph.microsoft.com/.default'
      })
    }
  )
  cache.token = res.access_token
  cache.exp = now + res.expires_in
  return cache.token
}

export async function resolveSiteId(event?: any): Promise<string> {
  const ms = getMs(event)
  if (ms.siteId) return ms.siteId
  if (cache.siteId) return cache.siteId
  const token = await getGraphToken(event)
  const site = await ofetch<any>(
    `https://graph.microsoft.com/v1.0/sites/${ms.siteHostname}:${ms.sitePath}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  cache.siteId = site.id
  return cache.siteId!
}

export async function resolveListId(event?: any): Promise<string> {
  const ms = getMs(event)
  if (ms.listId) return ms.listId
  if (cache.listId) return cache.listId
  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event)
  const displayName = ms.listDisplayName!.replace(/'/g, "''")
  const data = await ofetch<any>(
    `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}/lists?$filter=displayName eq '${displayName}'`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const list = data?.value?.[0]
  if (!list?.id) throw createError({ statusCode: 500, statusMessage: `Lista no encontrada: ${ms.listDisplayName}` })
  cache.listId = list.id
  return cache.listId!
}


