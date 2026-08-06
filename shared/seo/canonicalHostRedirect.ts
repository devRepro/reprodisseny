export const CANONICAL_ORIGIN = "https://reprodisseny.com";
export const VERCEL_PRODUCTION_HOST = "reprodisseny.vercel.app";

/**
 * Canonicaliza únicamente el dominio de producción asignado por Vercel.
 * La ruta y la query proceden de la URL solicitada y se conservan en el destino.
 */
export function resolveCanonicalHostRedirect(requestUrl: URL) {
  if (requestUrl.hostname !== VERCEL_PRODUCTION_HOST) return null;

  return `${CANONICAL_ORIGIN}${requestUrl.pathname}${requestUrl.search}`;
}
