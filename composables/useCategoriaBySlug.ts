// composables/useCategoriaBySlug.ts
import type { Categoria } from '@/types'
   // ← necesario
/**
 * Carga una única categoría a partir de su slug
 */
export const useCategoriaBySlug = (slug: string) => {
  return useAsyncData<Categoria | null>(`categoria-${slug}`, () =>
    queryCollection('categorias')    // carpeta content/categorias/
      .where('slug', '=', slug)      // filtra por frontmatter.slug === slug
      .first()                     // devuelve un único documento o null
  )
}


