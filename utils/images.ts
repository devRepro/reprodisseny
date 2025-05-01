// utils/images.ts

/**
 * Devuelve la URL completa para una imagen según su tipo.
 * Fallback incluido si no se especifica.
 */
export function resolveImageUrl(path?: string, type?: string): string {
    if (!path) return '/img/placeholder.webp'
  
    if (path.startsWith('/') || path.startsWith('http')) return path
  
    const base =
      type === 'categoria'
        ? '/img/categorias/'
        : type === 'producto'
        ? '/img/productos/'
        : '/img/otros/'
  
    return `${base}${path}`
  }
  
  /**
   * Devuelve el texto alternativo por defecto si no se proporciona uno explícito.
   */
  export function defaultAlt(title?: string): string {
    return title || 'Imagen del contenido'
  }
  
  /**
   * Verifica si una imagen existe o no (por si usas SSR con recursos remotos).
   * ⚠️ Nota: Solo funciona en cliente o con SSR + HEAD request.
   */
  export async function imageExists(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: 'HEAD' })
      return res.ok
    } catch {
      return false
    }
  }
  