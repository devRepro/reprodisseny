// server/api/crm/leads.post.ts
import { z } from 'zod'
import {
  defineEventHandler,
  readBody,
  getHeader,
  createError,
  setResponseStatus,
} from 'h3'
import { ofetch } from 'ofetch'
import { useRuntimeConfig } from '#imports'
import { getGraphToken, resolveSiteId, resolveListId } from '~/server/utils/graphClient.server.ts'

// 1) Schema del producto que envía el formulario
const ProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
})

// 2) Schema del payload completo
const LeadPayloadSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().optional().nullable(),
  empresa: z.string().optional().nullable(),
  comentario: z.string().max(4000).optional().nullable(),

  cantidad: z.coerce.number().optional().nullable(),
  producto: ProductSchema,
  extras: z.record(z.any()).optional().default({}),

  origen: z.string().optional().nullable(),
  utm: z.record(z.any()).optional().nullable(),
})

export default defineEventHandler(async (event) => {
  // 1) lee y valida el body
  const body = await readBody(event)

  // Log de ayuda mientras depuras (puedes quitarlo luego)
  console.log('[crm/leads] body =', JSON.stringify(body, null, 2))

  let p: z.infer<typeof LeadPayloadSchema>
  try {
    p = LeadPayloadSchema.parse(body)
  } catch (e: any) {
    console.error('[crm/leads] Zod error:', e?.issues || e?.message)
    throw createError({
      statusCode: 400,
      statusMessage: 'Datos de formulario inválidos',
      data: e?.issues ?? e?.message,
    })
  }

  // 2) config CRM (mapeo a columnas internas de SharePoint)
  const { crm } = useRuntimeConfig(event) as {
    crm: {
      emailField?: string
      productField: string
      commentsField?: string
      phoneField?: string
      companyField?: string
      dateField?: string
      attributesField?: string
      quantityField?: string
      originField?: string
      utmField?: string
    }
  }

  if (!crm?.productField) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Falta crm.productField en runtimeConfig (internal name de "Producte sol·licitat")',
    })
  }

  // 3) token + ids SharePoint
  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event)
  const listId = await resolveListId(event)

  // 4) extras vienen ya agrupados
  const extras = p.extras ?? {}

  // JSON compacto de producto + selección
  const productJson = {
    name: p.producto.name,
    slug: p.producto.slug,
    sku: p.producto.sku,
    url: p.producto.url,
    selection: {
      cantidad: p.cantidad ?? null,
      ...extras,
    },
    context: {
      origen: p.origen ?? getHeader(event, 'referer') ?? '',
      utm: p.utm ?? null,
    },
  }

  // 5) mapeo a columnas internas
  const fields: Record<string, any> = {}

  // Título del item
  fields['Title'] = p.nombre

  if (crm.emailField) fields[crm.emailField] = p.email
  if (crm.commentsField) fields[crm.commentsField] = p.comentario ?? ''
  if (crm.phoneField) fields[crm.phoneField] = p.telefono ?? ''
  if (crm.companyField) fields[crm.companyField] = p.empresa ?? ''
  if (crm.dateField) fields[crm.dateField] = new Date().toISOString()
  if (crm.quantityField && p.cantidad != null) {
    fields[crm.quantityField] = p.cantidad
  }
  if (crm.originField) {
    fields[crm.originField] = productJson.context.origen
  }
  if (crm.utmField && p.utm) {
    fields[crm.utmField] = JSON.stringify(p.utm)
  }

  // Columna de producto (texto multilínea) -> JSON compacto
  fields[crm.productField] = JSON.stringify(productJson)

  // opcional: columna separada solo para extras
  if (crm.attributesField && Object.keys(extras).length > 0) {
    fields[crm.attributesField] = JSON.stringify(extras)
  }

  // 6) crear ítem en SharePoint
  try {
    const created = await ofetch(
      `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(
        siteId
      )}/lists/${encodeURIComponent(listId)}/items`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: { fields },
      }
    )

    setResponseStatus(event, 201)
    return {
      ok: true,
      item: { id: created?.id ?? '', fields: created?.fields ?? fields },
    }
  } catch (err: any) {
    console.error('[crm/leads] Graph error:', err?.data || err)
    const msg =
      err?.data?.error?.message ||
      err?.message ||
      'Fallo al crear el ítem en SharePoint'
    throw createError({ statusCode: err?.status || 500, statusMessage: msg })
  }
})
