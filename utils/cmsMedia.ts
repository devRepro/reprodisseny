// utils/cmsMedia.ts
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
  
    // aplica hasta 2 pasadas para no romper URLs válidas
    for (let i = 0; i < 2; i++) {
      const next = s.replace(/%25([0-9A-Fa-f]{2})/g, "%$1")
      if (next === s) break
      s = next
    }
  
    return s
  }
  
  export function normalizeCmsMediaSrc(v: unknown): string {
    return toAssetUrl(normalizeCmsImageUrl(v))
  }