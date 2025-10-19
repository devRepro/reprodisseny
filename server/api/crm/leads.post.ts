import { z } from 'zod'
import { defineEventHandler, readBody, getHeader, createError, setResponseStatus } from 'h3'
import { ofetch } from 'ofetch'
import { getGraphToken, resolveSiteId, resolveListId, getListColumnsMap } from '~/server/utils/graph'

// Esquema de tu payload
const LeadPayloadSchema = z.object({
  producto: z.string().min(1),
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().optional().nullable(),
  empresa: z.string().optional().nullable(),
  mensaje: z.string().max(4000).optional().nullable(),
  origen: z.string().optional().nullable(),
  cantidad: z.coerce.number().optional().nullable(),
  utm: z.record(z.string()).optional().nullable()
}).passthrough()

export default defineEventHandler(async (event) => {
  // 1) Validación
  const body = await readBody(event)
  let p: z.infer<typeof LeadPayloadSchema>
  try { p = LeadPayloadSchema.parse(body) }
  catch (e: any) {
    throw createError({ statusCode: 400, statusMessage: 'Datos de formulario inválidos', data: e?.issues ?? e?.message })
  }

  // 2) Graph + IDs
  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event) // GET /sites/{hostname}:/{path} :contentReference[oaicite:2]{index=2}
  const listId = await resolveListId(event)
  if (!siteId || !listId) throw createError({ statusCode: 500, statusMessage: 'No se pudo resolver siteId o listId' })

  // 3) Mapa displayName -> internal
  const col = await getListColumnsMap(event)
  const nameOf = (display: string, fallback?: string) => col.get(display) ?? fallback

  // 4) Construye 'fields' con nombres INTERNOS, solo si existe la columna
  //   - 'Client' en SharePoint suele ser el Title renombrado -> internal 'Title'
  const fields: Record<string, any> = {}

  const put = (display: string, value: any, fallback?: string) => {
    const k = nameOf(display, fallback)
    if (!k || value === undefined) return
    fields[k] = value
  }

  // Mapeo a tus columnas (display names del pantallazo)
  put('Client', p.nombre, 'Title')
  put('Correu electrònic', p.email)
  put('Telèfon', p.telefono ?? '')
  put('Empresa', p.empresa ?? '')
  put('Producte sol·licitat', p.producto ?? '')
  put('Comentari', p.mensaje ?? '')

  // Requeridos en tu lista:
  // - Data sol·licitud: tu lista ya muestra "Hoy" como valor por defecto, así que lo omitimos.
  // - Estat: si no lo envías, pon "Nou" (choice)
  put('Estat', 'Nou')

  // Extras útiles si creaste las columnas:
  put('Origen', p.origen ?? getHeader(event, 'referer') ?? '')
  put('Quantitat', p.cantidad ?? null)              // si la columna es "Quantitat" (número)
  put('UTM', p.utm ? JSON.stringify(p.utm) : '')    // si guardas UTM como texto

  // 5) Crear el ítem (POST /lists/{list-id}/items con { fields })
  // https://learn.microsoft.com/graph/api/listitem-create
  try {
    const created = await ofetch(
      `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}/lists/${encodeURIComponent(listId)}/items`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: { fields } }
    )
    setResponseStatus(event, 201)
    return { ok: true, item: { id: created?.id ?? '', fields: created?.fields ?? fields } }
  } catch (err: any) {
    const msg = err?.data?.error?.message || err?.message || 'Fallo al crear el ítem en SharePoint'
    throw createError({ statusCode: err?.status || 500, statusMessage: msg })
  }
})
