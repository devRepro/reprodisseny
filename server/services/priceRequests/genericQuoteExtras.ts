const GENERIC_QUOTE_PRODUCT_SLUG = "presupuesto-generico";

const PRODUCT_TYPES = new Set([
  "adhesivos",
  "gran-formato",
  "expositores",
  "publicaciones",
  "packaging",
  "otro",
]);

export function sanitizeGenericQuoteExtras(
  productSlug: string | null,
  extras: Record<string, unknown>,
): Record<string, string | boolean> {
  if (productSlug !== GENERIC_QUOTE_PRODUCT_SLUG) return {};

  const clean: Record<string, string | boolean> = {};
  if (typeof extras.productType === "string" && PRODUCT_TYPES.has(extras.productType)) {
    clean.productType = extras.productType;
  }
  if (typeof extras.needAdvice === "boolean") {
    clean.needAdvice = extras.needAdvice;
  }
  return clean;
}
