// server/api/cms/contact.post.ts
import { z } from "zod"
import {
  defineEventHandler,
  readBody,
  getHeader,
  createError,
  setResponseStatus,
} from "h3"

import { createPriceRequest } from "~/server/services/priceRequests/priceRequestService.server"
import { rateLimit, ipHash, getClientIp } from "~/server/utils/rateLimit.server"
import { normalizeLeadTracking } from "~/utils/tracking/leadAttribution"

const ContactPayloadSchema = z.object({
  website: z.string().optional().nullable(), // honeypot

  nombre: z.string().min(2).max(120),
  email: z.string().email().max(160),
  telefono: z.string().max(40).optional().nullable(),
  codigoPostal: z.string().max(20).optional().nullable(),
codigo_postal: z.string().max(20).optional().nullable(),
postalCode: z.string().max(20).optional().nullable(),
cp: z.string().max(20).optional().nullable(),

  empresa: z.string().max(160).optional().nullable(),
  company: z.string().max(160).optional().nullable(),

  producto: z.string().max(200).optional().nullable(),
  product: z.string().max(200).optional().nullable(),

  consulta: z.string().max(5000).optional().nullable(),
  comentario: z.string().max(5000).optional().nullable(),

  consent: z.boolean(),

  sourceUrl: z.string().max(500).optional().nullable(),
  productUrl: z.string().max(500).optional().nullable(),
  origen: z.string().max(120).optional().nullable(),

  utm: z.record(z.any()).optional().nullable(),
  tracking: z.record(z.any()).optional().nullable(),
})

function cleanString(value: unknown, max = 300) {
  if (typeof value !== "string") return ""

  return value.trim().slice(0, max)
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const cleaned = cleanString(value)

    if (cleaned) return cleaned
  }

  return ""
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  let p: z.infer<typeof ContactPayloadSchema>

  try {
    p = ContactPayloadSchema.parse(body)
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      message: "Dades de formulari invàlides",
      data: e?.issues ?? e?.message,
    })
  }

  // Honeypot: respuesta silenciosa
  if (p.website && p.website.trim()) {
    setResponseStatus(event, 200)
    return { ok: true }
  }

  if (!p.consent) {
    throw createError({
      statusCode: 400,
      message: "Falta el consentiment",
    })
  }

  function firstStringMax(max: number, ...values: unknown[]) {
  for (const value of values) {
    const cleaned = cleanString(value, max)

    if (cleaned) return cleaned
  }

  return ""
}

function cleanClientMessage(value: unknown) {
  const text = cleanString(value, 5000)

  return text
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim()

      return !/^(Origen|Tipo|Página|Pagina|UTM):/i.test(trimmed)
    })
    .join("\n")
    .trim()
}

  // Mismo criterio de protección que las solicitudes de precio:
  // 10 peticiones / 10 minutos / IP.
  const ip = getClientIp(event) || "unknown"
  const rl = await rateLimit(`contact:${ipHash(ip)}`, 10, 600)

  if (!rl.ok) {
    throw createError({
      statusCode: 429,
      message: "Massa sol·licituds. Torna-ho a provar més tard.",
    })
  }

  const sourceUrl = firstString(
  p.sourceUrl,
  p.productUrl,
  getHeader(event, "referer"),
)

const origin = firstString(p.origen, "contact_form")

const company = firstString(p.empresa, p.company)
const postalCode = firstString(
  p.codigoPostal,
  p.codigo_postal,
  p.postalCode,
  p.cp,
)

const productName = firstString(p.producto, p.product) || "Consulta web"

const userMessage = cleanClientMessage(
  firstStringMax(5000, p.consulta, p.comentario),
)

if (!userMessage) {
  throw createError({
    statusCode: 400,
    message: "Falta la consulta",
  })
}

const normalizedTracking = normalizeLeadTracking({
  tracking: p.tracking ?? null,
  utm: p.utm ?? null,
  sourceUrl,
  categorySlug: "contacte",
  productSlug: null,
  formType: "contact",
})

  try {
    const created = await createPriceRequest(event, {
  name: p.nombre,
  email: p.email,
  phone: p.telefono ?? "",
  company: company || undefined,

  // Solo lo que ha escrito el cliente.
  // Esto es lo que acabará en Comentari.
  message: userMessage,

  categorySlug: "contacte",
  product: {
    name: productName,
    slug: null,
    sku: null,
    url: sourceUrl || null,
  },

  // Información útil, pero separada del comentario comercial.
  extras: {
    formType: "contact",
    origin,
    sourceUrl: normalizedTracking.sourceUrl || sourceUrl || null,
    productName,
    postalCode: postalCode || null,
  },

  consent: Boolean(p.consent),
  sourceUrl: normalizedTracking.sourceUrl || sourceUrl,
  utm: p.utm ?? null,
  tracking: normalizedTracking,

  initialStatus: "Nova",
  attachment: null,
  fileKind: "other",
})

    setResponseStatus(event, created.duplicated ? 200 : 201)

    return {
      ok: true,
      duplicated: created.duplicated,
      item: {
        id: created.itemId,
        requestKey: created.requestKey,
      },
      message: created.duplicated
        ? "Ja teníem registrada aquesta consulta. En breu ens posarem en contacte."
        : "Hem rebut la teva consulta. Et respondrem en menys de 24h laborables.",
    }
  } catch (e: any) {
    console.error("CONTACT FORM TO PRICE REQUEST ERROR", {
      message: e?.message,
      statusCode: e?.statusCode,
      statusMessage: e?.statusMessage,
      data: e?.data,
      responseStatus: e?.response?.status,
      responseStatusText: e?.response?.statusText,
      responseData: e?.response?._data,
    })

    const status = e?.statusCode || e?.response?.status || 500

    throw createError({
      statusCode: status,
      message:
        e?.response?._data?.error?.message ||
        e?.data?.error?.message ||
        e?.statusMessage ||
        e?.message ||
        "Error guardant la consulta",
    })
  }
})
