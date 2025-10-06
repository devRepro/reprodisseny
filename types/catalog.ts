// types/catalog.ts
import type { FormField, FaqItem, ProductSchema, CollectionPageSchema, BaseSchema } from './seo'

// Campos SEO comunes
export interface SeoBase {
  metaTitle?: string
  metaDescription?: string
  keywords?: string[] | string
}

// Campos de listado (opcionales) que a veces muestras en grids
export interface ListingFields {
  sku?: string
  price?: number
  priceCurrency?: string
  brand?: string
  inStock?: boolean
  ratingValue?: number
  reviewCount?: number
  featured?: boolean
  order?: number
  galleryImages?: string[] | any[]
  searchTerms?: string[]
  googlePlaceId?: string
}

// Nodo base del catálogo
export interface CatalogNodeBase extends SeoBase, ListingFields {
  id?: string | number
  title: string
  slug: string
  path: string
  description: string
  image?: string
  alt?: string
  nav?: string
  navigation?: boolean
  schemaType?: string
  schema?: CollectionPageSchema | ProductSchema | BaseSchema | Record<string, any>
  faqs?: FaqItem[]
  formFields?: FormField[]
}

// --- Tipos concretos ---

export interface Categoria extends CatalogNodeBase {
  type: 'categoria'
  // para compatibilidad con listados que esperan 'category'
  category?: string | null
}

export interface Subcategoria extends CatalogNodeBase {
  type: 'subcategoria'
  category: string // slug de la categoría padre
  children?: Producto[]
}

export interface Producto extends CatalogNodeBase {
  type: 'producto'
  category: string            // slug de la categoría padre
  sku: string
  price?: number
  priceCurrency?: string
  brand?: string
  inStock?: boolean
  schema?: ProductSchema | BaseSchema
}

// Discriminated union para cualquier nodo
export type CatalogNode = Categoria | Subcategoria | Producto

// Type guards útiles
export const isCategoria = (n: CatalogNode | null | undefined): n is Categoria =>
  !!n && n.type === 'categoria'

export const isSubcategoria = (n: CatalogNode | null | undefined): n is Subcategoria =>
  !!n && n.type === 'subcategoria'

export const isProducto = (n: CatalogNode | null | undefined): n is Producto =>
  !!n && n.type === 'producto'
