// types/content.ts
import type { Categoria, Subcategoria, Producto } from './catalog'

/** Metadatos comunes que expone Nuxt Content en el doc renderizable */
export interface ContentDocBase {
  _path: string
  _id?: string
  title?: string
  body?: any
}

/** Un doc de categoría que vive en content/categorias/**/index.md */
export type CategoriaDoc = ContentDocBase & Partial<Categoria>

/** Si más adelante haces subcategorías o fichas */
export type SubcategoriaDoc = ContentDocBase & Partial<Subcategoria>
export type ProductoDoc    = ContentDocBase & Partial<Producto>
