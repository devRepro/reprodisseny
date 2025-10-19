// server/api/crm/leads.post.ts
import { z } from 'zod'
import { defineEventHandler, readBody, getHeader, createError, setResponseStatus } from 'h3'
import { ofetch } from 'ofetch'
import { getGraphToken, resolveSiteId, resolveListId } from '~/server/utils/graph'

// Esquema base + extras
const LeadPayloadSchema = z.object({
  producto: z.string().min(1),
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().optional().nullable(),
  empresa: z.string().optional().nullable(),
  mensaje: z.string().max(4000).optional().nullable(),
  origen: z.string().optional().nullable(),
  cantidad: z.coerce.number().optional().nullable(),
  utm: z.record(z.string()).optional().nullable(),
  productData: z.any().optional()
}).passthrough()

const BASE_KEYS = new Set([
  'producto','productData','nombre','email','telefono','empresa','mensaje','origen','cantidad','utm'
])

export default defineEventHandler(async (event) => {
  // 1) valida
  const body = await readBody(event)
  let p: z.infer<typeof LeadPayloadSchema>
  try { p = LeadPayloadSchema.parse(body) }
  catch (e: any) {
    throw createError({ statusCode: 400, statusMessage: 'Datos de formulario inválidos', data: e?.issues ?? e?.message })
  }

  // 2) config CRM (nombres internos)
  const { crm } = useRuntimeConfig(event) as {
    crm: {
      emailField?: string
      productField: string
      commentsField?: string
      phoneField?: string
      companyField?: string
      dateField?: string
      // opcional: donde guardar extras si quieres (texto multilínea)
      attributesField?: string
      // opcional: cantidad si tienes columna dedicada
      quantityField?: string
      originField?: string
      utmField?: string
    }
  }
  if (!crm?.productField) {
    throw createError({ statusCode: 500, statusMessage: 'Falta crm.productField en runtimeConfig (internal name de "Producte sol·licitat")' })
  }

  // 3) token + ids
  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event)
  const listId = await resolveListId(event)

  // 4) compón JSON de producto + elecciones
  const extras: Record<string, any> = {}
  for (const [k,v] of Object.entries(p)) {
    if (!BASE_KEYS.has(k) && v !== undefined && v !== null && v !== '') extras[k] = v
  }
  const productJson = {
    name: p.producto,
    meta: p.productData ?? null,
    selection: { cantidad: p.cantidad ?? null, ...extras },
    context: {
      origen: p.origen ?? getHeader(event, 'referer') ?? '',
      utm: p.utm ?? null
    }
  }

  // 5) mapea a columnas internas (config)
  const fields: Record<string, any> = {}
  fields['Title'] = p.nombre
  if (crm.emailField)    fields[crm.emailField]    = p.email
  if (crm.commentsField) fields[crm.commentsField] = p.mensaje ?? ''
  if (crm.phoneField)    fields[crm.phoneField]    = p.telefono ?? ''
  if (crm.companyField)  fields[crm.companyField]  = p.empresa ?? ''
  if (crm.dateField)     fields[crm.dateField]     = new Date().toISOString()
  if (crm.quantityField && p.cantidad != null) fields[crm.quantityField] = p.cantidad
  if (crm.originField)   fields[crm.originField]   = productJson.context.origen
  if (crm.utmField && p.utm) fields[crm.utmField]  = JSON.stringify(p.utm)

  // Producto (texto multilínea) -> JSON compacto
  fields[crm.productField] = JSON.stringify(productJson)

  // opcional: además guarda solo los extras en otra columna si la configuras
  if (crm.attributesField && Object.keys(extras).length > 0) {
    fields[crm.attributesField] = JSON.stringify(extras)
  }

  // 6) crea el ítem
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
    const msg = err?.data?.error?.message || err?.message || 'Fallo al crear el ítem en SharePoint'
    throw createError({ statusCode: err?.status || 500, statusMessage: msg })
  }
})
