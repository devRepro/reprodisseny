// utils/googleAvatar.ts

const GOOGLE_USERCONTENT_HOST_RE = /(^|\.)googleusercontent\.com$/i;

const SIZE_TOKEN_RE = /(^|[?&=])s(\d+)(?=[\-/]|$)/g;
const SZ_QUERY_RE = /([?&]sz=)(\d+)(?=&|$)/g;

/**
 * Reduce el tamaño de un avatar de Google (googleusercontent.com) sin alterar
 * el resto de parámetros ni romper la URL.
 *
 * Soporta el formato oficial de la Places API:
 *   ...=s128-c0x00000000-cc-rp-mo  ->  ...=s64-c0x00000000-cc-rp-mo
 * y el formato de query "?sz=128".
 *
 * Es seguro ante null/undefined, string vacío, URLs no Google o malformadas,
 * y es idempotente (s64 permanece s64).
 */
export function optimizeGoogleAvatarUrl(
  url: string | null | undefined,
  size = 64,
): string | null | undefined {
  if (url == null) return url;

  const trimmed = String(url).trim();
  if (!trimmed) return trimmed;

  const candidate = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;

  let host: string;
  try {
    host = new URL(candidate).host;
  } catch {
    return url;
  }

  if (!GOOGLE_USERCONTENT_HOST_RE.test(host)) {
    return url;
  }

  const desired = String(size);

  const withPathSize = trimmed.replace(
    SIZE_TOKEN_RE,
    (match, pre) => `${pre}s${desired}`,
  );

  return withPathSize.replace(
    SZ_QUERY_RE,
    (match, pre) => `${pre}${desired}`,
  );
}
