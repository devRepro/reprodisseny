import { z } from "zod";

export const CONTACT_SUBMISSION_ERROR =
  "No hemos podido enviar la solicitud. Inténtalo de nuevo.";

export const contactFormSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa un nombre válido").max(120),
  email: z.string().trim().email("Introduce un correo electrónico válido").max(160),
  telefono: z.string().trim().max(40)
    .regex(/^[\d\s+\-]*$/, "Solo se permiten números y símbolos válidos")
    .nullish(),
  codigoPostal: z.string().trim()
    .refine((value) => !value || /^\d{5}$/.test(value), {
      message: "Introduce un código postal válido de 5 dígitos",
    }).nullish(),
  consulta: z.string().max(5000)
    .transform((value) => value.split(/\r?\n/)
      .filter((line) => !/^(Origen|Tipo|Página|Pagina|UTM):/i.test(line.trim()))
      .join("\n").trim())
    .pipe(z.string().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")),
  consent: z.boolean().refine((value) => value === true, {
    message: "Es necesario aceptar la política de privacidad",
  }),
  website: z.string().nullish(),
});

export const contactPayloadSchema = contactFormSchema.extend({
  empresa: z.string().trim().max(160).nullish(),
  producto: z.string().trim().max(200).nullish(),
  sourceUrl: z.string().trim().max(500).nullish(),
  origen: z.string().trim().max(120).nullish(),
  utm: z.record(z.unknown()).nullish(),
  tracking: z.record(z.unknown()).nullish(),
});

// Preserve the aliases accepted by the existing contact endpoint.
export function normalizeContactAliases(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const body = value as Record<string, unknown>;
  const first = (...values: unknown[]) => values.find((entry) =>
    entry != null && (typeof entry !== "string" || entry.trim() !== ""));
  return {
    ...body,
    codigoPostal: first(body.codigoPostal, body.codigo_postal, body.postalCode, body.cp),
    empresa: first(body.empresa, body.company),
    producto: first(body.producto, body.product),
    consulta: first(body.consulta, body.comentario),
    sourceUrl: first(body.sourceUrl, body.productUrl),
  };
}
