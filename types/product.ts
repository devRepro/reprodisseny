// types/product.ts
export interface ProductFrontmatter {
    type?: 'producto'
    title: string
    description?: string
    image?: string
    alt?: string
  
    metatitle?: string
    metadescription?: string
    keywords?: string[]
    searchTerms?: string[]
  
    sku?: string
    price?: number
    priceCurrency?: string // 'EUR'
    brand?: string
    inStock?: boolean
  
    galleryImages?: string[]
    ratingValue?: number
    reviewCount?: number
  
    formFields?: Array<Record<string, any>>
  
    schema?: Record<string, any>
  }
  
  export interface ProductListItem {
    title?: string
    description?: string
    image?: string
    alt?: string
    path?: string
    order?: number
    slug?: string
  }
  
  export interface ProductsPayload {
    items: ProductListItem[]
    total: number
  }
  