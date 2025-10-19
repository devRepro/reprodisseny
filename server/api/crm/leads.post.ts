// server/api/crm/leads.post.ts
import { z } from 'zod'
import { defineEventHandler, readBody, getHeader, createError, setResponseStatus } from 'h3'
import { ofetch } from 'ofetch'
import { resolveSiteId, resolveListId, getGraphToken } from '~/server/utils/graph'

// Esquema que encaja con tu LeadPayload del front
const LeadPayloadSchema = z.object({
  producto: z.string().min(1),
  nombre: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional().nullable(),
  empresa: z.string().optional().nullable(),
  mensaje: z.string().max(4000).optional().nullable(),
  origen: z.string().optional().nullable(),
  cantidad: z.coerce.number().optional().nullable(),
  utm: z.record(z.string()).optional().nullable()
}).passthrough()

// Claves base (todo lo demás se considera "extra" y se intentará mapear 1:1)
const BASE_KEYS = new Set([
  'producto','nombre','email','telefono','empresa','mensaje','origen','cantidad','utm'
])

export default defineEventHandler(async (event) => {
  // 1) Validación
  const body = await readBody(event)
  let payload: z.infer<typeof LeadPayloadSchema>
  try {
    payload = LeadPayloadSchema.parse(body)
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Datos de formulario inválidos',
      data: e?.issues ?? e?.message
    })
  }

  // 2) Resuelve Graph + destino
  const token = await getGraphToken()
  const siteId = await resolveSiteId()
  const listId = await resolveListId()
  if (!siteId || !listId) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo resolver siteId o listId' })
  }

  // 3) Mapeo -> columnas internas de tu lista (ajusta nombres si difieren)
  const fields: Record<string, any> = {
    Title: payload.nombre,
    Email: payload.email,
    Telefono: payload.telefono ?? '',
    Empresa: payload.empresa ?? '',
    Mensaje: payload.mensaje ?? '',
    NombreProducto: payload.producto,
    Cantidad: payload.cantidad ?? null,
    Origen: payload.origen ?? getHeader(event, 'referer') ?? '',
    UTM: payload.utm ? JSON.stringify(payload.utm) : '',
    CreatedFrom: 'Website'
  }

  // 4) Merge de extras (campos dinámicos) tal cual → requieren columnas homónimas en SharePoint
  for (const [k, v] of Object.entries(payload)) {
    if (!BASE_KEYS.has(k)) fields[k] = v
  }

  // 5) Llamada a Graph (crear ítem en la lista)
  try {
    const created = await ofetch(
      `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}/lists/${encodeURIComponent(listId)}/items`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: { fields }
      }
    )
    setResponseStatus(event, 201)
    return { ok: true, item: { id: created?.id ?? '', fields: created?.fields ?? fields } }
  } catch (err: any) {
    // Devuelve detalle útil si Graph responde con error
    const message = err?.data?.error?.message || err?.message || 'Fallo al crear el ítem en SharePoint'
    throw createError({ statusCode: err?.status || 500, statusMessage: message })
  }
})
