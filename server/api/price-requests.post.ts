import { z } from "zod"
import {
  defineEventHandler,
  readMultipartFormData,
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
});

const LooseObjectSchema = z.record(z.any());

const TrackingSchema = z
  .object({
    context: LooseObjectSchema.optional().nullable(),
    attribution: LooseObjectSchema.optional().nullable(),

    // Compatibilidad si desde el frontend mandas campos ya normalizados
    TrackingSource: z.string().optional().nullable(),
    TrackingMedium: z.string().optional().nullable(),
    TrackingCampaign: z.string().optional().nullable(),
    TrackingCampaignId: z.string().optional().nullable(),
    SourceUrl: z.string().optional().nullable(),
    UtmJson: z.string().optional().nullable(),
  })
  .passthrough()
  .optional()
  .nullable();

const PayloadSchema = z.object({
  website: z.string().optional().nullable(), // honeypot

  name: z.string().min(2).max(80),
  email: z.string().email().max(120),

  phone: z
    .string({
      required_error: "El teléfono es obligatorio",
      invalid_type_error: "El teléfono debe ser un texto",
    })
    .trim()
    .min(1, "El teléfono es obligatorio")
    .min(9, "Introduce un teléfono válido")
    .max(30, "El teléfono es demasiado largo"),
  postalCode: z
  .string()
  .trim()
  .max(20, "El código postal es demasiado largo")
  .regex(/^[A-Za-z0-9\s-]*$/, "Código postal no válido")
  .optional()
  .nullable(),  
  company: z.string().optional().nullable(),

  message: z.string().max(4000).optional().nullable(),

  categorySlug: z.string().min(1).max(120),
  product: ProductSchema,
  extras: z.record(z.any()).optional().default({}),

  consent: z.boolean(),
  sourceUrl: z.string().min(1).max(300),

  // Legacy
  utm: z.record(z.any()).optional().nullable(),

  /**
   * Tracking nuevo estándar:
   * - contexto de landing/formulario
   * - atribución first/last touch
   * - gclid/gbraid/wbraid
   * - campaña/anuncio/origen
   */
  tracking: TrackingSchema,

  initialStatus: z.string().optional().nullable(),
});

  
const FileKindSchema = z
  .enum(["design", "brief", "proof", "final", "other"])
  .optional()
  .default("design")

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanString(value: unknown, max = 300) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  if (!trimmed) return null;

  return trimmed.slice(0, max);
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const cleaned = cleanString(value);

    if (cleaned) return cleaned;
  }

  return null;
}

function normalizeLeadTracking(input: {
  tracking?: Record<string, any> | null;
  utm?: Record<string, any> | null;
  sourceUrl: string;
  categorySlug: string;
  productSlug?: string | null;
}) {
  const tracking = isRecord(input.tracking) ? input.tracking : {};
  const utm = isRecord(input.utm) ? input.utm : {};

  const context = isRecord(tracking.context) ? tracking.context : {};
  const attribution = isRecord(tracking.attribution) ? tracking.attribution : {};

  const firstTouch = isRecord(attribution.first) ? attribution.first : {};
  const lastTouch = isRecord(attribution.last) ? attribution.last : {};
  const selectedTouch = Object.keys(lastTouch).length ? lastTouch : firstTouch;

  const trackingSource =
    firstString(
      tracking.TrackingSource,
      tracking.trackingSource,
      selectedTouch.source,
      lastTouch.source,
      firstTouch.source,
      utm.utm_source,
      utm.source,
    ) || "direct";

  const trackingMedium =
    firstString(
      tracking.TrackingMedium,
      tracking.trackingMedium,
      selectedTouch.medium,
      lastTouch.medium,
      firstTouch.medium,
      utm.utm_medium,
      utm.medium,
    ) || "direct";

  const trackingCampaign = firstString(
    tracking.TrackingCampaign,
    tracking.trackingCampaign,
    selectedTouch.campaign,
    lastTouch.campaign,
    firstTouch.campaign,
    context.campaignName,
    utm.utm_campaign,
    utm.campaign,
  );

  const trackingCampaignId = firstString(
    tracking.TrackingCampaignId,
    tracking.trackingCampaignId,
    selectedTouch.campaignId,
    lastTouch.campaignId,
    firstTouch.campaignId,
    context.campaignId,
    utm.utm_id,
    utm.campaign_id,
  );

  const sourceUrl =
    firstString(
      tracking.SourceUrl,
      tracking.sourceUrl,
      selectedTouch.landingUrl,
      lastTouch.landingUrl,
      firstTouch.landingUrl,
      input.sourceUrl,
    ) || input.sourceUrl;

  const raw = {
    schemaVersion: 1,
    receivedAt: new Date().toISOString(),

    normalized: {
      trackingSource,
      trackingMedium,
      trackingCampaign,
      trackingCampaignId,
      sourceUrl,
      categorySlug: input.categorySlug,
      productSlug: input.productSlug ?? null,
    },

    context,
    attribution,
    utm,

    rawTracking: tracking,
  };

  return {
    trackingSource,
    trackingMedium,
    trackingCampaign,
    trackingCampaignId,
    sourceUrl,
    utmJson: JSON.stringify(raw),
  };
}


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

  const parsed = PayloadSchema.safeParse(rawPayload)

  if (!parsed.success) {
    console.error("[PRICE REQUEST][API][ZOD ERROR]", parsed.error.flatten())
    throw createError({
      statusCode: 400,
      message: "Dades de formulari invàlides",
      data: parsed.error.flatten(),
    })
  }

  const p = parsed.data

  if (!p.consent) {
    throw createError({
      statusCode: 400,
      message: "Falta el consentiment",
    })
  }

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

  const normalizedTracking = normalizeLeadTracking({
  tracking: p.tracking ?? null,
  utm: p.utm ?? null,
  sourceUrl: p.sourceUrl,
  categorySlug: p.categorySlug,
  productSlug: p.product.slug ?? null,
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