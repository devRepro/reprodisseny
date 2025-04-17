// types/index.ts

export interface FormField {
  label: string
  name: string
  type: 'text' | 'number' | 'select'
  required: boolean
  options?: string[]
}

export interface SchemaOrg {
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
  schema?: SchemaOrg
}

export interface Subcategoria {
  title: string
  slug: string
  type: 'subcategoria'
  path: string
  children?: Producto[]
  [key: string]: any
}

export interface Categoria {
  title: string
  navigation?: boolean
  nav: string
  slug: string
  description: string
  keywords?: string[]
  image?: string
  alt?: string
  type?: 'categoria'
  path: string
  formFields?: FormField[]
  children?: (Producto | Subcategoria)[]
}
