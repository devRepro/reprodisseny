// server/api/crm/leads.post.ts
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
import {
  getGraphToken,
  resolveSiteId,
  resolveListId,
} from "~/server/utils/graphClient.server"

const clip = (v: unknown, max: number) => {
  const s = String(v ?? "")
  return s.length > max ? s.slice(0, max) : s
}

// 1) Schema del producto que envía el formulario
const ProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
})

// 2) Schema del payload (lead de producto)
const LeadPayloadSchema = z.object({
  // honeypot
  website: z.string().optional().nullable(),

  nombre: z.string().min(2).max(120),
  email: z.string().email().max(180),
  telefono: z.string().optional().nullable(),
  empresa: z.string().optional().nullable(),
  comentario: z.string().max(4000).optional().nullable(),

  cantidad: z.coerce.number().optional().nullable(),
  producto: ProductSchema,

  // extras (evita JSON gigante)
  extras: z
    .record(
      z.union([
        z.string().max(200),
        z.number(),
        z.boolean(),
        z.null(),
      ])
    )
    .optional()
    .default({}),

  origen: z.string().optional().nullable(),
  utm: z.record(z.any()).optional().nullable(),

  consent: z.boolean(),
  sourceUrl: z.string().max(300).optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  let p: z.infer<typeof LeadPayloadSchema>
  try {
    p = LeadPayloadSchema.parse(body)
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: "Datos de formulario inválidos",
      data: e?.issues ?? e?.message,
    })
  }

  // Honeypot: si viene relleno, lo tratamos como bot (silencioso)
  if (p.website && p.website.trim()) {
    setResponseStatus(event, 204)
    return { ok: true }
  }

  // Config CRM (mapeo a columnas internas de SharePoint)
  const { crm } = useRuntimeConfig(event) as {
    crm: {
      // mapeo columnas
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
      consentField?: string
      sourceUrlField?: string

      // opcional: si quieres fijar la lista de LEADS aquí
      leadsListId?: string
    }
  }

  if (!crm?.productField) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Falta crm.productField en runtimeConfig (internal name de "Producto solicitado")',
    })
  }

  // Token + IDs SharePoint
  const token = await getGraphToken(event)
  const siteId = await resolveSiteId(event)

  // Si has creado otra lista para contacto y has cambiado resolveListId,
  // define crm.leadsListId para que ESTE endpoint apunte a la lista de leads.
  const listId = crm?.leadsListId || (await resolveListId(event))

  const referer = getHeader(event, "referer") ?? ""
  const origin = (p.origen ?? referer ?? "product-page").toString()

  const sourceUrl = (p.sourceUrl ?? referer ?? "").toString()

  const extras = p.extras ?? {}

  // JSON compacto de producto + selección
  const productJson = {
    name: p.producto.name,
    slug: p.producto.slug ?? null,
    sku: p.producto.sku ?? null,
    url: p.producto.url ?? null,
    selection: {
      cantidad: p.cantidad ?? null,
      ...extras,
    },
    context: {
      origen: origin,
      utm: p.utm ?? null,
      sourceUrl: sourceUrl || null,
    },
  }

  // Mapeo a columnas
  const fields: Record<string, any> = {}

  // Title del item
  fields["Title"] = clip(`${p.nombre} — ${p.producto?.name || "Solicitud"}`, 250)

  if (crm.emailField) fields[crm.emailField] = p.email
  if (crm.commentsField) fields[crm.commentsField] = p.comentario ?? ""
  if (crm.phoneField) fields[crm.phoneField] = p.telefono ?? ""
  if (crm.companyField) fields[crm.companyField] = p.empresa ?? ""
  if (crm.dateField) fields[crm.dateField] = new Date().toISOString()

  if (crm.consentField) fields[crm.consentField] = !!p.consent
  if (crm.sourceUrlField && sourceUrl) fields[crm.sourceUrlField] = clip(sourceUrl, 300)

  if (crm.quantityField && p.cantidad != null) fields[crm.quantityField] = p.cantidad
  if (crm.originField) fields[crm.originField] = clip(origin, 255)

  if (crm.utmField && p.utm) fields[crm.utmField] = clip(JSON.stringify(p.utm), 8000)

  // Columna producto -> JSON compacto
  fields[crm.productField] = clip(JSON.stringify(productJson), 12000)

  // Opcional: columna separada solo para extras
  if (crm.attributesField && Object.keys(extras).length > 0) {
    fields[crm.attributesField] = clip(JSON.stringify(extras), 8000)
  }

  // Crear ítem en SharePoint
  try {
    const created = await ofetch(
      `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(
        siteId
      )}/lists/${encodeURIComponent(listId)}/items`,
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
    return {
      ok: true,
      item: { id: created?.id ?? "", fields: created?.fields ?? fields },
    }
  } catch (err: any) {
    console.error("[crm/leads] Graph error:", err?.data || err)
    const msg =
      err?.data?.error?.message ||
      err?.message ||
      "Fallo al crear el ítem en SharePoint"
    throw createError({ statusCode: err?.status || 500, statusMessage: msg })
  }
})
