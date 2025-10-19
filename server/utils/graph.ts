// server/utils/graph.ts
import { ofetch } from 'ofetch'
import { createError } from 'h3'
import type { H3Event } from 'h3'

/**
 * Config esperada en runtimeConfig.ms (nuxt.config.ts):
 *  - tenantId, clientId, clientSecret
 *  - EITHER: siteId  OR  (siteHostname + sitePath)
 *  - EITHER: listId OR  listDisplayName
 */
type MsCfg = {
  tenantId: string
  clientId: string
  clientSecret: string
  // SharePoint site
  siteId?: string // triple id "host,siteGuid,webGuid" (recomendado si lo tienes)
  siteHostname?: string
  sitePath?: string
  // SharePoint list
  listId?: string
  listDisplayName?: string
}

function getMsConfig (event?: H3Event): MsCfg {
  const { ms } = useRuntimeConfig(event) as { ms: MsCfg }
  const hasSiteId = !!ms?.siteId
  const hasHostPath = !!ms?.siteHostname && !!ms?.sitePath
  const hasList = !!(ms?.listId || ms?.listDisplayName)

  const missing: string[] = []
  if (!ms?.tenantId) missing.push('tenantId')
  if (!ms?.clientId) missing.push('clientId')
  if (!ms?.clientSecret) missing.push('clientSecret')
  if (!hasSiteId && !hasHostPath) missing.push('siteId_or_(siteHostname+sitePath)')
  if (!hasList) missing.push('listId_or_listDisplayName')

  if (missing.length) {
    throw createError({
      statusCode: 500,
      statusMessage: `Faltan credenciales MS en runtimeConfig.ms: ${missing.join(', ')}`
    })
  }
  return ms
}

// Cache simple en proceso (válido para Nitro) + dedupe de token
const cache: {
  token?: string
  exp?: number
  siteId?: string
  listId?: string
  inflightToken?: Promise<string>
} = {}

/**
 * Obtiene un token de aplicación (client credentials) para Microsoft Graph.
 * Incluye diagnóstico del error de AAD en consola (sin exponer secretos).
 */
export async function getGraphToken (event?: H3Event): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cache.token && cache.exp && cache.exp - 60 > now) return cache.token!

  if (!cache.inflightToken) {
    const { tenantId, clientId, clientSecret } = getMsConfig(event)
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'https://graph.microsoft.com/.default'
    })

    cache.inflightToken = ofetch<{ access_token: string; expires_in: number }>(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        body,
        headers: { 'content-type': 'application/x-www-form-urlencoded' }
      }
    )
      .then(res => {
        cache.token = res.access_token
        cache.exp = Math.floor(Date.now() / 1000) + res.expires_in
        return cache.token!
      })
      .catch((e: any) => {
        const data = e?.data || e?.response?._data || {}
        // Diagnóstico útil (no imprime secretos)
        console.error('[Graph Token Error]', {
          status: e?.status || e?.statusCode,
          error: data?.error,
          error_description: data?.error_description,
          // señales mínimas de presencia de config (sin valores)
          tenantIdPresent: true,
          clientIdPresent: true,
          secretPresent: true
        })
        throw createError({
          statusCode: 500,
          statusMessage: `Error al obtener token de Graph: ${data?.error || e?.statusText || 'desconocido'}`
        })
      })
      .finally(() => {
        // evita quedar colgado si falla
        setTimeout(() => { cache.inflightToken = undefined }, 0)
      })
  }

  return cache.inflightToken
}

/**
 * Devuelve el siteId (triple id). Si ya lo tienes en config, lo usa tal cual.
 * Si no, lo resuelve vía host + path.
 */
export async function resolveSiteId (event?: H3Event): Promise<string> {
  if (cache.siteId) return cache.siteId
  const { siteId, siteHostname, sitePath } = getMsConfig(event)

  if (siteId) {
    cache.siteId = siteId
    return cache.siteId
  }

  const token = await getGraphToken(event)
  const site = await ofetch<{ id: string }>(
    `https://graph.microsoft.com/v1.0/sites/${siteHostname}:${sitePath}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!site?.id) {
    throw createError({ statusCode: 500, statusMessage: 'Site no encontrado. Revisa siteHostname y sitePath.' })
  }
  cache.siteId = site.id
  return cache.siteId
}

/**
 * Devuelve el listId. Si está en config lo usa; si no, resuelve por displayName.
 */
export async function resolveListId (event?: H3Event): Promise<string> {
  const { listId, listDisplayName } = getMsConfig(event)
  if (listId) return listId
  if (cache.listId) return cache.listId

  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event)

  const url = new URL(`https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}/lists`)
  const escapedName = (listDisplayName || '').replace(/'/g, "''") // escapa comillas simples para OData
  url.searchParams.set('$filter', `displayName eq '${escapedName}'`)

  const data = await ofetch<{ value?: Array<{ id: string; displayName: string }> }>(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  })

  const list = data.value?.[0]
  if (!list) {
    throw createError({ statusCode: 500, statusMessage: `Lista no encontrada: ${listDisplayName}` })
  }
  cache.listId = list.id
  return cache.listId
}

/** Limpia el cache en memoria (útil en hot-reload o pruebas) */
export function clearGraphCache () {
  cache.token = undefined
  cache.exp = undefined
  cache.siteId = undefined
  cache.listId = undefined
  cache.inflightToken = undefined
}

// --- al final de server/utils/graph.ts ---
export async function getListColumnsMap(event?: any): Promise<Map<string, string>> {
  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event)
  const listId = await resolveListId(event)

  // Trae displayName y name (internal) de las columnas de la lista
  // https://learn.microsoft.com/graph/api/list-list-columns
  const res = await ofetch<any>(
    `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}/lists/${encodeURIComponent(listId)}/columns?$select=name,displayName`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const map = new Map<string, string>()
  for (const c of res?.value ?? []) {
    // displayName -> internal name
    if (c.displayName && c.name) map.set(String(c.displayName), String(c.name))
  }
  return map
}

