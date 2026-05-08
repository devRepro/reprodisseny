// utils/cmsMedia.ts

const DEFAULT_MEDIA_BASE_URL = "https://webcms.blob.core.windows.net/media"
const DEFAULT_BLOB_ORIGIN = "https://webcms.blob.core.windows.net"

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "")
}

function trimLeadingSlash(value: string): string {
  return value.replace(/^\/+/, "")
}

function getPublicMediaConfig() {
  try {
    const config = useRuntimeConfig()

    return {
      mediaBaseUrl: trimTrailingSlash(
        String(config.public.mediaBaseUrl || DEFAULT_MEDIA_BASE_URL),
      ),
      mediaBlobOrigin: trimTrailingSlash(
        String(config.public.mediaBlobOrigin || DEFAULT_BLOB_ORIGIN),
      ),
    }
  } catch {
    return {
      mediaBaseUrl: DEFAULT_MEDIA_BASE_URL,
      mediaBlobOrigin: DEFAULT_BLOB_ORIGIN,
    }
  }
}

function joinMediaUrl(mediaBaseUrl: string, path: string): string {
  return `${trimTrailingSlash(mediaBaseUrl)}/${trimLeadingSlash(path)}`
}

export function toAssetUrl(v: unknown): string {
  let s = String(v ?? "").trim()
  if (!s) return ""

  if (/^(https?:)?\/\//i.test(s) || s.startsWith("data:") || s.startsWith("blob:")) {
    return s
  }

  s = s.replace(/\\/g, "/")
  s = s.replace(/^\.?\//, "")
  s = s.replace(/^\/+/, "")

  return "/" + s
}

/**
 * Corrige doble encoding típico del CMS:
 * %2520 -> %20
 * %2528 -> %28
 * etc.
 */
export function normalizeCmsImageUrl(v: unknown): string {
  let s = String(v ?? "").trim()
  if (!s) return ""

  // Aplica hasta 2 pasadas para no romper URLs válidas.
  for (let i = 0; i < 2; i++) {
    const next = s.replace(/%25([0-9A-Fa-f]{2})/g, "%$1")
    if (next === s) break
    s = next
  }

  return s
}

export function normalizeCmsMediaSrc(v: unknown): string {
  const normalized = toAssetUrl(normalizeCmsImageUrl(v))
  if (!normalized) return ""

  if (normalized.startsWith("data:") || normalized.startsWith("blob:")) {
    return normalized
  }

  const { mediaBaseUrl, mediaBlobOrigin } = getPublicMediaConfig()

  // Caso 1:
  // /media/category/adhesivos.webp
  // -> https://media.reprodisseny.com/media/category/adhesivos.webp
  if (normalized.startsWith("/media/")) {
    return joinMediaUrl(mediaBaseUrl, normalized.replace(/^\/media\//, ""))
  }

  // Caso 2:
  // /category/adhesivos.webp
  // -> https://media.reprodisseny.com/media/category/adhesivos.webp
  if (normalized.startsWith("/")) {
    return joinMediaUrl(mediaBaseUrl, normalized)
  }

  try {
    const url = new URL(normalized)

    // Caso 3:
    // https://webcms.blob.core.windows.net/media/category/adhesivos.webp
    // -> https://media.reprodisseny.com/media/category/adhesivos.webp
    if (url.origin === mediaBlobOrigin && url.pathname.startsWith("/media/")) {
      const pathInsideMedia = url.pathname.replace(/^\/media\//, "")

      return joinMediaUrl(mediaBaseUrl, `${pathInsideMedia}${url.search}`)
    }

    // Caso 4:
    // Si ya viene de media.reprodisseny.com, no tocar.
    return normalized
  } catch {
    return normalized
  }
}