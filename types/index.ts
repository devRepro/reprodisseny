// types/index.ts

export interface FormField {
  label: string
  name: string
  type: 'text' | 'number' | 'select'
  required: boolean
  options?: string[]
}

// Schema.org para un producto
export interface SchemaProduct {
  '@type': 'Product'
  name: string
  description: string
  image: string
  sku: string
  brand: {
    '@type': 'Organization'
    name: string
  }
  offers: {
    '@type': 'Offer'
    price: number
    priceCurrency: string
    availability: string
  }
}

// Schema.org para una página de colección (categoría)
export interface SchemaCollectionPage {
  '@context': 'https://schema.org'
  '@type': 'CollectionPage'
  name: string
  description: string
  url: string
  image?: string
  provider?: {
    '@type': 'Organization'
    name: string
    url: string
    logo?: {
      '@type': 'ImageObject'
      url: string
    }
  }
  hasPart?: { '@type': 'CollectionPage'; name: string; url: string }[]
}

// Un producto individual
export interface Producto {
  title: string
  slug: string
  category: string
  description: string
  keywords?: string[]
  image: string
  alt?: string
  tags?: string[]
  navigation?: boolean
  metatitle?: string
  metadescription?: string
  type?: 'producto'
  sku?: string
  price?: number
  priceCurrency?: string
  inStock?: boolean
  brand?: string
  path: string
  formFields?: FormField[]
  schema?: SchemaProduct
}

// Subcategoría que agrupa productos
export interface Subcategoria {
  title: string
  slug: string
  type: 'subcategoria'
  path: string
  children?: Producto[]
  [key: string]: any
}

// FAQ item para la sección de preguntas frecuentes
export interface FaqItem {
  question: string
  answer: string
}

// Datos completos de una categoría, tal como los usa la página `/categorias/[category]`
export interface Categoria {
  title: string
  slug: string
  nav?: string                   // texto corto para menú
  navigation?: boolean
  description: string
  keywords?: string[]
  image?: string
  alt?: string
  type?: 'categoria'
  path: string
  formFields?: FormField[]
  children?: (Producto | Subcategoria)[]
  
  // NUEVOS CAMPOS para la página de categoría:
  productos?: Producto[]         // lista a mostrar en el grid
  topProducts?: Producto[]       // top ventas
  newProducts?: Producto[]       // novedades
  popularProducts?: Producto[]   // populares
  faqs?: FaqItem[]               // preguntas frecuentes
  
  // Schema.org para SEO
  schemaPage?: SchemaCollectionPage
}

// Datos para el formulario de consulta rápida
export interface InquiryData {
  name: string
  email: string
  message: string
}

// Interfaz de retorno de useCategoriaBySlug()
export interface UseCategoriaBySlugResult {
  data: Categoria | null
  pending: boolean
  error: Error | null
}
