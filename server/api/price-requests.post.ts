import { z } from "zod"
import {
  defineEventHandler,
  readMultipartFormData,
  createError,
  setResponseStatus,
} from "h3"

import { createPriceRequest } from "~/server/services/priceRequests/priceRequestService.server"
import { rateLimit, ipHash, getClientIp } from "~/server/utils/rateLimit.server"
import { priceRequestPayloadSchema } from "~/shared/schemas/priceRequest"
import { normalizeServerLeadTracking } from "~/server/services/priceRequests/leadTrackingNormalization"

  
const FileKindSchema = z
  .enum(["design", "brief", "proof", "final", "other"])
  .optional()
  .default("design")

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)


  if (!parts?.length) {
    throw createError({
      statusCode: 400,
      message: "Formulari buit o format invàlid",
    })
  }

  const payloadPart = parts.find((p) => p.name === "payload")
  const filePart = parts.find((p) => p.name === "file")
  const fileKindPart = parts.find((p) => p.name === "fileKind")

  if (!payloadPart?.data) {
    throw createError({
      statusCode: 400,
      message: "Falta el payload",
    })
  }

  let rawPayload: unknown
  try {
    rawPayload = JSON.parse(Buffer.from(payloadPart.data).toString("utf8"))
  } catch (err) {
    console.error("[PRICE REQUEST][API][JSON ERROR]", err)
    throw createError({
      statusCode: 400,
      message: "Payload JSON invàlid",
    })
  }

  // Honeypot
  if ((rawPayload as any)?.website) {
    setResponseStatus(event, 200)
    return { ok: true }
  }

  // Rate limit: 10 req / 10 min / IP
  const ip = getClientIp(event) || "unknown"
  const rl = await rateLimit(`price-req:${ipHash(ip)}`, 10, 600)
  if (!rl.ok) {
    throw createError({
      statusCode: 429,
      message: "Massa sol·licituds. Torna-ho a provar més tard.",
    })
  }

  const parsed = priceRequestPayloadSchema.safeParse(rawPayload)

  if (!parsed.success) {
    console.error("[PRICE REQUEST][API][ZOD ERROR]", parsed.error.flatten())
    throw createError({
      statusCode: 400,
      message: "Dades de formulari invàlides",
      data: parsed.error.flatten(),
    })
  }

  const p = parsed.data

  const fileKindRaw = fileKindPart?.data
    ? Buffer.from(fileKindPart.data).toString("utf8")
    : undefined

  const fileKind = FileKindSchema.parse(fileKindRaw)

  const attachment = filePart?.data?.length
    ? {
        filename: filePart.filename || "upload.bin",
        mimeType: filePart.type || "application/octet-stream",
        buffer: Buffer.from(filePart.data),
        size: filePart.data.length,
      }
    : null

  if (import.meta.dev) {
  console.info("[PRICE REQUEST][API][NORMALIZED PAYLOAD]", {
  name: p.name,
  email: p.email ? "[redacted]" : null,
  phone: p.phone ? "[redacted]" : null,
  postalCode: p.postalCode ? "[redacted]" : null,
  company: p.company ? "[redacted]" : null,
  message: p.message ? "[redacted]" : null,
  categorySlug: p.categorySlug,
  product: p.product,
  extras: p.extras,
  consent: p.consent,
  sourceUrl: p.sourceUrl,
  utm: p.utm,
  tracking: p.tracking,
  initialStatus: p.initialStatus,
  attachment: attachment
    ? {
        filename: attachment.filename,
        mimeType: attachment.mimeType,
        size: attachment.size,
      }
    : null,
  fileKind,
});
}

  const normalizedTracking = normalizeServerLeadTracking({
  tracking: p.tracking ?? null,
  utm: p.utm ?? null,
  sourceUrl: p.sourceUrl,
  categorySlug: p.categorySlug,
  productSlug: p.product.slug ?? null,
  formType: "price_request",
});

  try {
    const created = await createPriceRequest(event, {
  name: p.name,
  email: p.email,
  phone: p.phone,
    postalCode: p.postalCode ?? null,
  company: p.company ?? undefined,
  message: p.message ?? "",
  categorySlug: p.categorySlug,
  product: p.product,
  extras: p.extras,
  consent: p.consent,

  sourceUrl: normalizedTracking.sourceUrl,

  // Mantengo utm legacy por compatibilidad
  utm: p.utm ?? null,

  // Nuevo tracking normalizado
  tracking: normalizedTracking,

  initialStatus: p.initialStatus || "Nova",
  attachment,
  fileKind,
});

    return {
      ok: true,
      duplicated: created.duplicated,
      itemId: created.itemId,
      requestKey: created.requestKey,
      file: created.file ?? null,
      message: created.duplicated
        ? "Ja teníem registrada aquesta sol·licitud. En breu ens posarem en contacte."
        : "Hem rebut la teva sol·licitud. Et respondrem en menys de 24h laborables.",
    }
  } catch (e: any) {
    console.error("PRICE REQUEST API ERROR", {
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
        "Error",
    })
  }
})
