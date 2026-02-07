// server/api/cms/contact.post.ts
import { z } from "zod"
import {
  defineEventHandler,
  readBody,
  getHeader,
  createError,
  setResponseStatus,
} from "h3"
import { ofetch } from "ofetch"
import { useRuntimeConfig } from "#imports"
import { getGraphToken } from "~/server/utils/graphClient.server"

type SpColumn = { name: string; displayName?: string }

const norm = (s: string) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // sin acentos
    .replace(/\s+/g, "") // sin espacios
    .replace(/[^a-z0-9_]/g, "") // limpio

function buildDict(columns: SpColumn[]) {
  const dict = new Map<string, string>()
  for (const c of columns) {
    dict.set(norm(c.name), c.name)
    if (c.displayName) dict.set(norm(c.displayName), c.name)
  }
  return dict
}

function pick(dict: Map<string, string>, ...labels: string[]) {
  for (const l of labels) {
    const hit = dict.get(norm(l))
    if (hit) return hit
  }
  return null
}

const ContactPayloadSchema = z.object({
  website: z.string().optional().nullable(), // honeypot

  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().optional().nullable(),

  // en tu form usas "consulta", pero por si envías "comentario" también:
  consulta: z.string().max(5000).optional().nullable(),
  comentario: z.string().max(5000).optional().nullable(),

  consent: z.boolean(),
  sourceUrl: z.string().optional().nullable(),
  productUrl: z.string().optional().nullable(), // por si lo mandas desde UI
  origen: z.string().optional().nullable(),
  utm: z.record(z.any()).optional().nullable(),
})

async function resolveCmsSiteId(event: any, token: string) {
  const cfg = useRuntimeConfig(event) as any
  const cms = cfg?.sharepoint?.cms || {}

  // 1) si viene CMS_SITE_ID, úsalo
  if (cms.siteId && String(cms.siteId).trim()) return String(cms.siteId).trim()

  // 2) si no, resuelve por hostname + path
  const host = String(cms.siteHostname || "").trim()
  const path = String(cms.sitePath || "").trim()

  if (!host || !path) {
    throw createError({
      statusCode: 500,
      statusMessage: `Falta config SharePoint (CMS): siteHostname/sitePath`,
      data: { host, path },
    })
  }

  // Graph: /sites/{hostname}:{server-relative-path}
  // Ej: https://graph.microsoft.com/v1.0/sites/reprodisseny.sharepoint.com:/sites/web-cms
  const siteRef = `${host}:${path.startsWith("/") ? path : `/${path}`}`

  const site = await ofetch<{ id: string }>(
    `https://graph.microsoft.com/v1.0/sites/${siteRef}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!site?.id) {
    throw createError({
      statusCode: 500,
      statusMessage: "No se pudo resolver el siteId de CMS por hostname/path",
      data: { siteRef },
    })
  }

  return site.id
}

async function getListColumns(token: string, siteId: string, listId: string) {
  const url =
    `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}` +
    `/lists/${encodeURIComponent(listId)}/columns?$select=name,displayName`

  const res = await ofetch<{ value: SpColumn[] }>(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res?.value || []
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  let p: z.infer<typeof ContactPayloadSchema>
  try {
    p = ContactPayloadSchema.parse(body)
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: "Datos de formulario inválidos",
      data: e?.issues ?? e?.message,
    })
  }

  // honeypot => “ok” silencioso
  if (p.website && p.website.trim()) {
    setResponseStatus(event, 204)
    return { ok: true }
  }

  const cfg = useRuntimeConfig(event) as any
  const listId = String(cfg?.contact?.listId || "").trim()

  if (!listId) {
    throw createError({
      statusCode: 500,
      statusMessage: "Falta runtimeConfig.contact.listId (SP_LIST_CONTACT_ID)",
    })
  }

  const token = await getGraphToken(event)
  const siteId = await resolveCmsSiteId(event, token)

  // Descarga columnas y mapea internal names por displayName
  const columns = await getListColumns(token, siteId, listId)
  const dict = buildDict(columns)

  const emailField = pick(dict, "Email", "Correo electrónico", "Correu electrònic", "E-mail")
  const phoneField = pick(dict, "Teléfono", "Telefon", "Phone")
  const msgField = pick(dict, "Consulta", "Mensaje", "Missatge", "Message", "Comentarios", "Comentari")
  const consentField = pick(dict, "Consent", "Consentimiento", "Privacidad", "RGPD", "GDPR")
  const sourceUrlField = pick(dict, "SourceUrl", "URL", "Url origen", "Origen URL", "Página", "PageUrl")
  const utmField = pick(dict, "UTM", "Utm")
  const dateField = pick(dict, "Fecha", "Data", "RequestedAt", "FechaSolicitud")
  const originField = pick(dict, "Origen", "Origin", "Referer")

  const message = (p.consulta ?? p.comentario ?? "").trim()
  const sourceUrl =
    (p.sourceUrl || p.productUrl || getHeader(event, "referer") || "").toString()

  // Campos SharePoint
  const fields: Record<string, any> = {}
  fields["Title"] = `${p.nombre} — Contacto web`

  if (emailField) fields[emailField] = p.email
  if (phoneField) fields[phoneField] = p.telefono ?? ""
  if (msgField) fields[msgField] = message
  if (consentField) fields[consentField] = !!p.consent
  if (sourceUrlField) fields[sourceUrlField] = sourceUrl
  if (originField) fields[originField] = p.origen ?? getHeader(event, "referer") ?? ""
  if (utmField && p.utm) fields[utmField] = JSON.stringify(p.utm)
  if (dateField) fields[dateField] = new Date().toISOString()

  try {
    const created = await ofetch(
      `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}` +
        `/lists/${encodeURIComponent(listId)}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: { fields },
      }
    )

    setResponseStatus(event, 201)
    return { ok: true, item: { id: created?.id ?? "" } }
  } catch (err: any) {
    const msg =
      err?.data?.error?.message ||
      err?.message ||
      "Fallo al crear el ítem en SharePoint (contacto)"
    throw createError({ statusCode: err?.status || 500, statusMessage: msg, data: err?.data })
  }
})
