// server/api/price-requests.post.ts
import { z } from "zod"
import {
  defineEventHandler,
  readBody,
  createError,
  setResponseStatus,
} from "h3"

import { createPriceRequest } from "~/server/services/priceRequests/priceRequestService.server"
import { rateLimit, ipHash, getClientIp } from "~/server/utils/rateLimit.server"

const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
})

const PayloadSchema = z.object({
  website: z.string().optional().nullable(), // honeypot

  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  message: z.string().min(1).max(4000),

  categorySlug: z.string().min(1).max(120),
  product: ProductSchema,
  extras: z.record(z.any()).optional().default({}), // sanitized server-side

  consent: z.boolean(),
  sourceUrl: z.string().min(1).max(300),
  utm: z.record(z.any()).optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Honeypot
  if (body?.website) {
    setResponseStatus(event, 200)
    return { ok: true }
  }

  // Rate limit: 10 req / 10 min / IP
  const ip = getClientIp(event) || "unknown"
  const rl = await rateLimit(`price-req:${ipHash(ip)}`, 10, 600)
  if (!rl.ok) {
    throw createError({
      statusCode: 429,
      statusMessage: "Massa sol·licituds. Torna-ho a provar més tard.",
    })
  }

  let p: z.infer<typeof PayloadSchema>
  try {
    p = PayloadSchema.parse(body)
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Dades de formulari invàlides" })
  }

  if (!p.consent) throw createError({ statusCode: 400, statusMessage: "Falta el consentiment" })

  try {
    const created = await createPriceRequest(event, {
      name: p.name,
      email: p.email,
      phone: p.phone ?? undefined,
      company: p.company ?? undefined,
      message: p.message,

      categorySlug: p.categorySlug,
      product: p.product,
      extras: p.extras,

      consent: p.consent,
      sourceUrl: p.sourceUrl,
      utm: p.utm ?? null,

      // MUST exist in SharePoint Choice "Estat"
      initialStatus: "Afegit CRM",
    })

    return {
      ok: true,
      duplicated: created.duplicated,
      itemId: created.itemId,
      message: created.duplicated
        ? "Ja teníem registrada aquesta sol·licitud. En breu ens posarem en contacte."
        : "Hem rebut la teva sol·licitud. Et respondrem en menys de 24h laborables.",
    }
  } catch (e: any) {
    const status = e?.statusCode || 500
    throw createError({ statusCode: status, statusMessage: e?.message || "Error" })
  }
})
