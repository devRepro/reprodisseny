// composables/useApiClient.ts
import { useAsyncData } from '#imports'

import type { Categoria, Producto } from '@/types'

/**
 * Devuelve una categoría por su slug.
 */
export function useCategoryBySlug(slug: string) {
  return useAsyncData<Categoria | null>(
    `category-${slug}`,
    () =>
      queryCollection('categorias')
        .where('slug', '=', slug)
        .where('type', '=', 'categoria')
        .first()
  )
}

/**
 * Devuelve un producto por su slug.
 */
export function useProductBySlug(slug: string) {
  return useAsyncData<Producto | null>(
    `product-${slug}`,
    () =>
      queryCollection('categorias')
        .where('slug', '=', slug)
        .where('type', '=', 'producto')
        .first()
  )
}

/**
 * Devuelve todos los productos de una categoría.
 */
export function useProductsByCategory(categorySlug: string) {
  return useAsyncData<Producto[]>(
    `products-in-${categorySlug}`,
    () =>
      queryCollection('categorias')
        .where('category', '=', categorySlug)
        .where('type', '=', 'producto')
        .all()
  )
}

/**
 * Devuelve todas las categorías activas (type === 'categoria').
 */
export function useAllCategories() {
  return useAsyncData<Categoria[]>(
    'all-categories',
    () =>
      queryCollection('categorias')
        .where('type', '=', 'categoria')
        .order('title', 'ASC')
        .all()
  )
}

/**
 * Búsqueda genérica en el contenido (categorías + productos).
 * Filtra por título o descripción.
 */
export function useSearchContent(term: string) {
  return useAsyncData<{ categorias: Categoria[]; productos: Producto[] }>(
    `search-${term}`,
    async () => {
      // Traemos todo el contenido y luego filtramos en memoria.
      const all = await queryCollection('categorias').all()
      const lower = term.toLowerCase().trim()
      const categorias = (all as Categoria[])
        .filter(i => i.type === 'categoria')
        .filter(i => i.title.toLowerCase().includes(lower) || (i.description?.toLowerCase().includes(lower)))
      const productos = (all as Producto[])
        .filter(i => i.type === 'producto')
        .filter(i => i.title.toLowerCase().includes(lower) || (i.description?.toLowerCase().includes(lower)))
      return { categorias, productos }
    }
  )
}
