import { z } from "zod";

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
  sourceUrlMax: 300,
} as const;

export const PRICE_REQUEST_PHONE_PATTERN = /^[\d\s+\-()]+$/;
export const PRICE_REQUEST_POSTAL_CODE_PATTERN = /^[A-Za-z0-9\s-]*$/;

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

const looseObjectSchema = z.record(z.unknown());

export const priceRequestTrackingSchema = z
  .object({
    context: looseObjectSchema.optional().nullable(),
    attribution: looseObjectSchema.optional().nullable(),
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

export const priceRequestProductSchema = z.object({
  name: z.string().trim().min(1).max(PRICE_REQUEST_LIMITS.productNameMax),
  slug: z.string().optional().nullable(),
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
  utm: z.record(z.unknown()).optional().nullable(),
  tracking: priceRequestTrackingSchema,
  initialStatus: z.string().optional().nullable(),
});

export type CreatePriceRequestInput = z.input<typeof priceRequestPayloadSchema>;
