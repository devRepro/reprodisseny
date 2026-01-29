// server/utils/graph.ts
import { ofetch } from "ofetch"
import { createError } from "h3"
import { useRuntimeConfig } from "#imports"

type MsAuthCfg = {
  tenantId: string
  clientId: string
  clientSecret: string
}

type SpTargetCfg = {
  siteId?: string
  siteHostname?: string
  sitePath?: string
  listId?: string
  listDisplayName?: string
}

type RuntimeCfg = {
  ms: MsAuthCfg
  sharepoint?: {
    crm?: SpTargetCfg
    cms?: SpTargetCfg
  }
  // fallback legacy (tu config actual)
  msLegacy?: SpTargetCfg
}

type Ctx = "crm" | "cms"

function getAuth(event?: any): MsAuthCfg {
  const cfg = useRuntimeConfig(event) as any
  const ms = cfg.ms as MsAuthCfg
  const missing = [
    ["tenantId", ms?.tenantId],
    ["clientId", ms?.clientId],
    ["clientSecret", ms?.clientSecret],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k)

  if (missing.length) {
    throw createError({
      statusCode: 500,
      statusMessage: `Faltan credenciales MS: ${missing.join(", ")}`,
    })
  }
  return ms
}

/**
 * Lee target CRM/CMS desde runtimeConfig.sharepoint[ctx]
 * y si no existe (para no romper lo actual), usa runtimeConfig.ms (legacy).
 */
function getTarget(event: any, ctx: Ctx): SpTargetCfg {
  const cfg = useRuntimeConfig(event) as any
  const target = cfg.sharepoint?.[ctx]

  // legacy: tu config actual ms trae site/list
  const legacy = cfg.ms as any

  const sp: SpTargetCfg = target ?? {
    siteId: legacy.siteId,
    siteHostname: legacy.siteHostname,
    sitePath: legacy.sitePath,
    listId: legacy.listId,
    listDisplayName: legacy.listDisplayName,
  }

  const missing = [
    ["site", sp.siteId || (sp.siteHostname && sp.sitePath) ? "ok" : ""],
    ["list", sp.listId || sp.listDisplayName ? "ok" : ""],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k)

  if (missing.length) {
    throw createError({
      statusCode: 500,
      statusMessage: `Falta config SharePoint (${ctx}): ${missing.join(", ")}`,
    })
  }

  return sp
}

// --- Cache ---
const tokenCache: { token?: string; exp?: number } = {}
const siteCache = new Map<string, string>() // key -> siteId
const listCache = new Map<string, string>() // key -> listId

function keyFromTarget(t: SpTargetCfg) {
  // clave estable para cachear por target
  return [
    t.siteId || "",
    t.siteHostname || "",
    t.sitePath || "",
  ].join("|")
}

function keyFromList(t: SpTargetCfg) {
  return [
    keyFromTarget(t),
    t.listId || "",
    t.listDisplayName || "",
  ].join("|")
}

export async function getGraphToken(event?: any): Promise<string> {
  const { tenantId, clientId, clientSecret } = getAuth(event)
  const now = Math.floor(Date.now() / 1000)
  if (tokenCache.token && tokenCache.exp && tokenCache.exp - 60 > now) return tokenCache.token

  const res = await ofetch<{ access_token: string; expires_in: number }>(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        scope: "https://graph.microsoft.com/.default",
      }),
    }
  )

  tokenCache.token = res.access_token
  tokenCache.exp = now + res.expires_in
  return tokenCache.token
}

export async function resolveSiteId(event: any, ctx: Ctx): Promise<string> {
  const t = getTarget(event, ctx)
  if (t.siteId) return t.siteId

  const k = keyFromTarget(t)
  const cached = siteCache.get(k)
  if (cached) return cached

  const token = await getGraphToken(event)
  const site = await ofetch<any>(
    `https://graph.microsoft.com/v1.0/sites/${t.siteHostname}:${t.sitePath}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  siteCache.set(k, site.id)
  return site.id
}

export async function resolveListId(event: any, ctx: Ctx): Promise<string> {
  const t = getTarget(event, ctx)
  if (t.listId) return t.listId

  const k = keyFromList(t)
  const cached = listCache.get(k)
  if (cached) return cached

  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event, ctx)
  const displayName = t.listDisplayName!.replace(/'/g, "''")

  const data = await ofetch<any>(
    `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(
      siteId
    )}/lists?$filter=displayName eq '${displayName}'`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  const list = data?.value?.[0]
  if (!list?.id) {
    throw createError({
      statusCode: 500,
      statusMessage: `Lista no encontrada (${ctx}): ${t.listDisplayName}`,
    })
  }

  listCache.set(k, list.id)
  return list.id
}

/**
 * Cliente Graph parametrizado por contexto:
 *   const crm = await getGraphClient(event, 'crm')
 *   const cms = await getGraphClient(event, 'cms')
 */
export async function getGraphClient(event: any, ctx: Ctx) {
  const token = await getGraphToken(event)
  const baseUrl = "https://graph.microsoft.com/v1.0"
  const baseHeaders = { Authorization: `Bearer ${token}` }

  return {
    ctx,
    resolveSiteId: () => resolveSiteId(event, ctx),
    resolveListId: () => resolveListId(event, ctx),
    api: (path: string) => ({
      get: (init?: any) =>
        ofetch(baseUrl + path, {
          ...init,
          headers: { ...baseHeaders, ...(init?.headers || {}) },
        }),
      post: (body: any, init?: any) =>
        ofetch(baseUrl + path, {
          method: "POST",
          body,
          ...init,
          headers: { ...baseHeaders, ...(init?.headers || {}) },
        }),
      patch: (body: any, init?: any) =>
        ofetch(baseUrl + path, {
          method: "PATCH",
          body,
          ...init,
          headers: { ...baseHeaders, ...(init?.headers || {}) },
        }),
      delete: (init?: any) =>
        ofetch(baseUrl + path, {
          method: "DELETE",
          ...init,
          headers: { ...baseHeaders, ...(init?.headers || {}) },
        }),
    }),
  }
}
