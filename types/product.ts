export interface ProductFrontmatter {
  type: 'producto'
  title: string
  description?: string
  image?: string
  alt?: string

  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  searchTerms?: string[]

  sku?: string
  brand?: string
  inStock?: boolean

  price?: number
  priceCurrency?: 'EUR'

  galleryImages?: string[]
  ratingValue?: number
  reviewCount?: number

  categorySlug: string
  categories?: string[]

  featured?: boolean
  order?: number
  published?: boolean

  tags?: string[]
  applications?: string[]
  materials?: string[]
  locationTypes?: Array<'interior' | 'exterior'>

  formFields?: ProductFormField[]
  schema?: Record<string, unknown>
}

export interface ProductFormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea' | 'checkbox' | 'file'
  required?: boolean
  placeholder?: string
  options?: Array<{
    label: string
    value: string
  }>
}

export interface ProductListItem {
  title: string
  slug: string
  path: string

  description?: string
  image?: string
  alt?: string

  categorySlug: string
  categories: string[]

  order?: number
  featured?: boolean
  inStock?: boolean

  searchTerms?: string[]
}

export interface ProductsPayload {
  items: ProductListItem[]
  total: number
}