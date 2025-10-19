// server/utils/graph.ts
import { ofetch } from 'ofetch'
import { createError } from 'h3'

type MsCfg = {
  tenantId: string; clientId: string; clientSecret: string;
  siteHostname: string; sitePath: string; listId?: string; listDisplayName?: string;
}

function getMsConfig(event?: any): MsCfg {
  const { ms } = useRuntimeConfig(event) as { ms: MsCfg }
  const missing = Object.entries({
    tenantId: ms.tenantId,
    clientId: ms.clientId,
    clientSecret: ms.clientSecret,
    siteHostname: ms.siteHostname,
    sitePath: ms.sitePath,
    listId_or_displayName: ms.listId || ms.listDisplayName
  }).filter(([, v]) => !v).map(([k]) => k)
  if (missing.length) {
    throw createError({
      statusCode: 500,
      statusMessage: `Faltan credenciales MS en runtimeConfig.ms: ${missing.join(', ')}`
    })
  }
  return ms
}

let cache:{ token?:string; exp?:number; siteId?:string; listId?:string } = {}

export async function getGraphToken(event?: any) {
  const { tenantId, clientId, clientSecret } = getMsConfig(event)
  const now = Math.floor(Date.now()/1000)
  if (cache.token && cache.exp && cache.exp-60 > now) return cache.token
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
    scope: 'https://graph.microsoft.com/.default'
  })
  const res = await ofetch<{ access_token:string; expires_in:number }>(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    { method:'POST', body }
  )
  cache.token = res.access_token
  cache.exp = now + res.expires_in
  return cache.token
} // Flujo client-credentials oficial. :contentReference[oaicite:5]{index=5}

// server/utils/graph.ts
import { ofetch } from 'ofetch'
import { createError } from 'h3'

type MsCfg = {
  tenantId: string; clientId: string; clientSecret: string;
  siteHostname: string; sitePath: string; listId?: string; listDisplayName?: string;
}

function getMsConfig(event?: any): MsCfg {
  const { ms } = useRuntimeConfig(event) as { ms: MsCfg }
  const missing = Object.entries({
    tenantId: ms.tenantId,
    clientId: ms.clientId,
    clientSecret: ms.clientSecret,
    siteHostname: ms.siteHostname,
    sitePath: ms.sitePath,
    listId_or_displayName: ms.listId || ms.listDisplayName
  }).filter(([, v]) => !v).map(([k]) => k)
  if (missing.length) {
    throw createError({
      statusCode: 500,
      statusMessage: `Faltan credenciales MS en runtimeConfig.ms: ${missing.join(', ')}`
    })
  }
  return ms
}

let cache:{ token?:string; exp?:number; siteId?:string; listId?:string } = {}

export async function getGraphToken(event?: any) {
  const { tenantId, clientId, clientSecret } = getMsConfig(event)
  const now = Math.floor(Date.now()/1000)
  if (cache.token && cache.exp && cache.exp-60 > now) return cache.token
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
    scope: 'https://graph.microsoft.com/.default'
  })
  const res = await ofetch<{ access_token:string; expires_in:number }>(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    { method:'POST', body }
  )
  cache.token = res.access_token
  cache.exp = now + res.expires_in
  return cache.token
} // Flujo client-credentials oficial. :contentReference[oaicite:5]{index=5}

export async function resolveSiteId(event?: any): Promise<string> {
  if (cache.siteId) return cache.siteId
  const { siteHostname, sitePath } = getMsConfig(event)
  const token = await getGraphToken(event)
  const site = await ofetch<any>(
    `https://graph.microsoft.com/v1.0/sites/${siteHostname}:${sitePath}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  cache.siteId = site.id
  return cache.siteId!  // Obtener sitio por host+ruta. :contentReference[oaicite:6]{index=6}
}

export async function resolveListId(event?: any): Promise<string> {
  const { listId, listDisplayName } = getMsConfig(event)
  if (listId) return listId
  if (cache.listId) return cache.listId
  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event)
  const data = await ofetch<any>(
    `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}/lists?$filter=displayName eq '${encodeURIComponent(listDisplayName!)}'`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const list = data.value?.[0]
  if (!list) throw createError({ statusCode: 500, statusMessage: `Lista no encontrada: ${listDisplayName}` })
  cache.listId = list.id
  return cache.listId!
}

export function clearGraphCache(){ cache = {} }
