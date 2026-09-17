export const CALENDAR_2027_LANDING_PATH = "/calendarios/calendarios-corporativos-2027";
export const CALENDAR_2027_LANDING_URL =
  "https://reprodisseny.com/calendarios/calendarios-corporativos-2027";

export const CALENDAR_PERSONALIZADOS_OLD_PRODUCT_PATH =
  "/productos/calendarios-personalizados";

const MIGRATED_SEO_PATHS = {
  [CALENDAR_PERSONALIZADOS_OLD_PRODUCT_PATH]: CALENDAR_2027_LANDING_PATH,
} as const;

function normalizePath(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  let pathname = raw;

  try {
    if (/^https?:\/\//i.test(raw)) {
      pathname = new URL(raw).pathname;
    }
  } catch {
    return "";
  }

  const normalized = pathname
    .split("#")[0]
    .split("?")[0]
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/\/+$/, "");

  if (!normalized) return "/";
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function resolveMigratedSeoPath(value: unknown) {
  const path = normalizePath(value);
  return MIGRATED_SEO_PATHS[path as keyof typeof MIGRATED_SEO_PATHS] || path;
}

export function isMigratedSeoSourcePath(value: unknown) {
  const path = normalizePath(value);
  return Object.prototype.hasOwnProperty.call(MIGRATED_SEO_PATHS, path);
}
