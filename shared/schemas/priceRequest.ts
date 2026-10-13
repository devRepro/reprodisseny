import { z } from "zod";
import {
  CALENDAR_LANDING_SLUG,
  CALENDAR_PRODUCT_SLUG,
  isValidCalendarSelection,
  isValidCalendarQuantity,
} from "../data/calendarProducts";
import {
  getLeadTrackingParamMax,
  LEAD_TRACKING_LIMITS,
  LEAD_TRACKING_PARAM_KEYS,
  type LeadTrackingParamKey,
} from "../tracking/leadTrackingLimits";

export const PRICE_REQUEST_LIMITS = {
  nameMax: 80,
  emailMax: 120,
  phoneMin: 9,
  phoneMax: 30,
  postalCodeMax: 20,
  companyMax: 200,
  messageMax: 4000,
  categorySlugMax: 120,
  productNameMax: 200,
  productSlugMax: 255,
  sourceUrlMax: LEAD_TRACKING_LIMITS.sourceUrlMax,
} as const;

export const PRICE_REQUEST_PHONE_PATTERN = /^[\d\s+\-()]+$/;
export const PRICE_REQUEST_POSTAL_CODE_PATTERN = /^[A-Za-z0-9\s-]*$/;

export function normalizePriceRequestSourceUrl(value: unknown) {
  if (typeof value !== "string") return "";

  return value.trim().slice(0, PRICE_REQUEST_LIMITS.sourceUrlMax);
}

function boundedString(value: unknown, max: number) {
  if (typeof value !== "string") return null;

  const cleaned = value.trim().slice(0, max);
  return cleaned || null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeTrackingParams(value: unknown) {
  if (!isRecord(value)) return null;

  const normalized: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(value)) {
    const key = rawKey.toLowerCase() as LeadTrackingParamKey;
    if (!LEAD_TRACKING_PARAM_KEYS.includes(key)) continue;

    const candidate = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    const cleaned = boundedString(candidate, getLeadTrackingParamMax(key));
    if (cleaned) normalized[key] = cleaned;
  }

  return Object.keys(normalized).length ? normalized : null;
}

const CONTEXT_KEYS = [
  "pageType",
  "pageLanguage",
  "contentGroup",
  "serviceName",
  "campaignName",
  "campaignId",
  "productSlug",
  "categorySlug",
  "formId",
  "formName",
] as const;

const ATTRIBUTION_TECHNICAL_KEYS = [
  "source",
  "medium",
  "campaign",
  "campaignId",
  "gadCampaignId",
  "term",
  "content",
  "firstSeenAt",
  "lastSeenAt",
] as const;

const ATTRIBUTION_CLICK_ID_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
] as const;

const ATTRIBUTION_URL_KEYS = ["landingPath", "landingUrl", "referrer"] as const;

function normalizeTrackingContext(value: unknown) {
  if (!isRecord(value)) return null;

  const normalized: Record<string, string> = {};
  for (const key of CONTEXT_KEYS) {
    const cleaned = boundedString(value[key], LEAD_TRACKING_LIMITS.contextValueMax);
    if (cleaned) normalized[key] = cleaned;
  }

  return Object.keys(normalized).length ? normalized : null;
}

function normalizeAttributionTouch(value: unknown) {
  if (!isRecord(value)) return null;

  const normalized: Record<string, string> = {};
  for (const key of ATTRIBUTION_TECHNICAL_KEYS) {
    const cleaned = boundedString(value[key], LEAD_TRACKING_LIMITS.technicalValueMax);
    if (cleaned) normalized[key] = cleaned;
  }
  for (const key of ATTRIBUTION_CLICK_ID_KEYS) {
    const cleaned = boundedString(value[key], LEAD_TRACKING_LIMITS.clickIdMax);
    if (cleaned) normalized[key] = cleaned;
  }
  for (const key of ATTRIBUTION_URL_KEYS) {
    const cleaned = boundedString(value[key], LEAD_TRACKING_LIMITS.attributionUrlMax);
    if (cleaned) normalized[key] = cleaned;
  }

  return Object.keys(normalized).length ? normalized : null;
}

function normalizePriceRequestTracking(value: unknown) {
  if (!isRecord(value)) return null;

  const attribution = isRecord(value.attribution)
    ? {
        first: normalizeAttributionTouch(value.attribution.first),
        last: normalizeAttributionTouch(value.attribution.last),
      }
    : null;
  const rawNormalized = isRecord(value.normalized) ? value.normalized : {};

  return {
    context: normalizeTrackingContext(value.context),
    attribution,
    routeUtm: normalizeTrackingParams(value.routeUtm),
    sourceUrl: normalizePriceRequestSourceUrl(value.sourceUrl),
    normalized: {
      trackingSource: boundedString(
        rawNormalized.trackingSource,
        LEAD_TRACKING_LIMITS.technicalValueMax,
      ),
      trackingMedium: boundedString(
        rawNormalized.trackingMedium,
        LEAD_TRACKING_LIMITS.technicalValueMax,
      ),
      trackingCampaign: boundedString(
        rawNormalized.trackingCampaign,
        LEAD_TRACKING_LIMITS.technicalValueMax,
      ),
      trackingCampaignId: boundedString(
        rawNormalized.trackingCampaignId,
        LEAD_TRACKING_LIMITS.technicalValueMax,
      ),
      sourceUrl: normalizePriceRequestSourceUrl(rawNormalized.sourceUrl),
    },
    TrackingSource: boundedString(
      value.TrackingSource,
      LEAD_TRACKING_LIMITS.technicalValueMax,
    ),
    TrackingMedium: boundedString(
      value.TrackingMedium,
      LEAD_TRACKING_LIMITS.technicalValueMax,
    ),
    TrackingCampaign: boundedString(
      value.TrackingCampaign,
      LEAD_TRACKING_LIMITS.technicalValueMax,
    ),
    TrackingCampaignId: boundedString(
      value.TrackingCampaignId,
      LEAD_TRACKING_LIMITS.technicalValueMax,
    ),
    SourceUrl: normalizePriceRequestSourceUrl(value.SourceUrl),
  };
}

export function normalizePriceRequestPayloadForTransport<T extends Record<string, any>>(
  payload: T,
) {
  return {
    ...payload,
    product: isRecord(payload.product)
      ? {
          ...payload.product,
          slug:
            typeof payload.product.slug === "string"
              ? payload.product.slug
                  .trim()
                  .slice(0, PRICE_REQUEST_LIMITS.productSlugMax)
              : payload.product.slug,
        }
      : payload.product,
    sourceUrl: normalizePriceRequestSourceUrl(payload.sourceUrl),
    utm: normalizeTrackingParams(payload.utm),
    tracking: normalizePriceRequestTracking(payload.tracking),
  };
}

export const priceRequestNameSchema = z
  .string({ required_error: "El nombre es obligatorio" })
  .trim()
  .min(2, "Introduce un nombre válido")
  .max(PRICE_REQUEST_LIMITS.nameMax, "El nombre es demasiado largo");

export const priceRequestEmailSchema = z
  .string({ required_error: "El email es obligatorio" })
  .trim()
  .email("Introduce un email válido")
  .max(PRICE_REQUEST_LIMITS.emailMax, "El email es demasiado largo");

export const priceRequestPhoneSchema = z
  .string({
    required_error: "El teléfono es obligatorio",
    invalid_type_error: "El teléfono debe ser un texto",
  })
  .trim()
  .min(1, "El teléfono es obligatorio")
  .min(PRICE_REQUEST_LIMITS.phoneMin, "Introduce un teléfono válido")
  .max(PRICE_REQUEST_LIMITS.phoneMax, "El teléfono es demasiado largo")
  .regex(PRICE_REQUEST_PHONE_PATTERN, "El formato del teléfono no es válido");

export const priceRequestPostalCodeSchema = z
  .string()
  .trim()
  .max(
    PRICE_REQUEST_LIMITS.postalCodeMax,
    "El código postal es demasiado largo",
  )
  .regex(PRICE_REQUEST_POSTAL_CODE_PATTERN, "Código postal no válido")
  .optional()
  .nullable();

export const priceRequestCompanySchema = z
  .string()
  .trim()
  .max(PRICE_REQUEST_LIMITS.companyMax, "La empresa es demasiado larga")
  .optional()
  .nullable();

export const priceRequestMessageSchema = z
  .string()
  .trim()
  .max(PRICE_REQUEST_LIMITS.messageMax, "El mensaje es demasiado largo")
  .optional()
  .nullable();

export const priceRequestConsentSchema = z.boolean().refine((value) => value, {
  message: "Debes aceptar la política de privacidad",
});

export const priceRequestContactSchema = z.object({
  name: priceRequestNameSchema,
  email: priceRequestEmailSchema,
  phone: priceRequestPhoneSchema,
  consent: priceRequestConsentSchema,
});

const optionalTechnicalString = z
  .string()
  .trim()
  .max(LEAD_TRACKING_LIMITS.technicalValueMax)
  .optional()
  .nullable();
const optionalContextString = z
  .string()
  .trim()
  .max(LEAD_TRACKING_LIMITS.contextValueMax)
  .optional()
  .nullable();
const optionalClickId = z
  .string()
  .trim()
  .max(LEAD_TRACKING_LIMITS.clickIdMax)
  .optional()
  .nullable();
const optionalAttributionUrl = z
  .string()
  .trim()
  .max(LEAD_TRACKING_LIMITS.attributionUrlMax)
  .optional()
  .nullable();

const priceRequestTrackingParamsSchema = z
  .object({
    utm_source: optionalTechnicalString,
    utm_medium: optionalTechnicalString,
    utm_campaign: optionalTechnicalString,
    utm_id: optionalTechnicalString,
    gad_campaignid: optionalTechnicalString,
    utm_term: optionalTechnicalString,
    utm_content: optionalTechnicalString,
    gclid: optionalClickId,
    gbraid: optionalClickId,
    wbraid: optionalClickId,
    fbclid: optionalClickId,
    msclkid: optionalClickId,
  })
  .strip();

const priceRequestTrackingContextSchema = z
  .object({
    pageType: optionalContextString,
    pageLanguage: optionalContextString,
    contentGroup: optionalContextString,
    serviceName: optionalContextString,
    campaignName: optionalContextString,
    campaignId: optionalContextString,
    productSlug: optionalContextString,
    categorySlug: optionalContextString,
    formId: optionalContextString,
    formName: optionalContextString,
  })
  .strip();

const priceRequestAttributionTouchSchema = z
  .object({
    source: optionalTechnicalString,
    medium: optionalTechnicalString,
    campaign: optionalTechnicalString,
    campaignId: optionalTechnicalString,
    gadCampaignId: optionalTechnicalString,
    term: optionalTechnicalString,
    content: optionalTechnicalString,
    gclid: optionalClickId,
    gbraid: optionalClickId,
    wbraid: optionalClickId,
    fbclid: optionalClickId,
    msclkid: optionalClickId,
    landingPath: optionalAttributionUrl,
    landingUrl: optionalAttributionUrl,
    referrer: optionalAttributionUrl,
    firstSeenAt: optionalTechnicalString,
    lastSeenAt: optionalTechnicalString,
  })
  .strip();

const priceRequestNormalizedTrackingSchema = z
  .object({
    trackingSource: optionalTechnicalString,
    trackingMedium: optionalTechnicalString,
    trackingCampaign: optionalTechnicalString,
    trackingCampaignId: optionalTechnicalString,
    sourceUrl: z
      .string()
      .trim()
      .max(LEAD_TRACKING_LIMITS.sourceUrlMax)
      .optional()
      .nullable(),
  })
  .strip();

export const priceRequestTrackingSchema = z
  .object({
    context: priceRequestTrackingContextSchema.optional().nullable(),
    attribution: z
      .object({
        first: priceRequestAttributionTouchSchema.optional().nullable(),
        last: priceRequestAttributionTouchSchema.optional().nullable(),
      })
      .strip()
      .optional()
      .nullable(),
    routeUtm: priceRequestTrackingParamsSchema.optional().nullable(),
    sourceUrl: z
      .string()
      .trim()
      .max(LEAD_TRACKING_LIMITS.sourceUrlMax)
      .optional()
      .nullable(),
    normalized: priceRequestNormalizedTrackingSchema.optional().nullable(),
    TrackingSource: optionalTechnicalString,
    TrackingMedium: optionalTechnicalString,
    TrackingCampaign: optionalTechnicalString,
    TrackingCampaignId: optionalTechnicalString,
    SourceUrl: z
      .string()
      .trim()
      .max(LEAD_TRACKING_LIMITS.sourceUrlMax)
      .optional()
      .nullable(),
    UtmJson: z
      .string()
      .max(LEAD_TRACKING_LIMITS.sharePointJsonMax)
      .optional()
      .nullable(),
  })
  .strip()
  .optional()
  .nullable();

export const priceRequestProductSchema = z.object({
  name: z.string().trim().min(1).max(PRICE_REQUEST_LIMITS.productNameMax),
  slug: z
    .string()
    .trim()
    .max(PRICE_REQUEST_LIMITS.productSlugMax)
    .optional()
    .nullable(),
  sku: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
});

export const priceRequestPayloadSchema = z.object({
  website: z.string().optional().nullable(),
  name: priceRequestNameSchema,
  email: priceRequestEmailSchema,
  phone: priceRequestPhoneSchema,
  postalCode: priceRequestPostalCodeSchema,
  company: priceRequestCompanySchema,
  message: priceRequestMessageSchema,
  categorySlug: z.string().trim().min(1).max(PRICE_REQUEST_LIMITS.categorySlugMax),
  product: priceRequestProductSchema,
  extras: z.record(z.unknown()).optional().default({}),
  consent: priceRequestConsentSchema,
  sourceUrl: z.string().trim().min(1).max(PRICE_REQUEST_LIMITS.sourceUrlMax),
  utm: priceRequestTrackingParamsSchema.optional().nullable(),
  tracking: priceRequestTrackingSchema,
  initialStatus: z.string().optional().nullable(),
}).superRefine((payload, ctx) => {
  const extras = payload.extras || {};
  const isCalendarLandingLead =
    payload.product.slug === CALENDAR_PRODUCT_SLUG &&
    extras.landing === CALENDAR_LANDING_SLUG;

  if (!isCalendarLandingLead) return;

  const model = extras.calendarModelId || extras.tipoCalendario;
  const size = extras.calendarSizeId || extras.tamano;
  const quantity = extras.cantidad;

  if (!model) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["extras", "tipoCalendario"],
      message: "Selecciona un modelo de calendario.",
    });
  }

  if (!size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["extras", "tamano"],
      message: "Selecciona una medida para el calendario.",
    });
  }

  if (model && size && !isValidCalendarSelection(model, size)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["extras", "tamano"],
      message: "La medida seleccionada no corresponde al modelo de calendario.",
    });
  }

  if (!isValidCalendarQuantity(quantity)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["extras", "cantidad"],
      message: "Indica una cantidad válida.",
    });
  }
});

export type CreatePriceRequestInput = z.input<typeof priceRequestPayloadSchema>;
