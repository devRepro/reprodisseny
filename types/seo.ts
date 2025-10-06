// types/seo.ts

export interface FormField {
    label: string
    name: string
    type: 'text' | 'number' | 'select'
    required: boolean
    options?: string[]
  }
  
  export interface FaqItem {
    question: string
    answer: string
  }
  
  // --- Schema.org (mínimos extensibles) ---
  
  export interface SchemaOrgBrand {
    '@type': 'Organization'
    name: string
  }
  
  export interface SchemaOrgOffer {
    '@type': 'Offer'
    price: number
    priceCurrency: string
    availability: string
  }
  
  export interface BaseSchema {
    '@type': string // 'Product', 'CollectionPage', etc.
    name?: string
    description?: string
    image?: string | string[]
    url?: string
    brand?: SchemaOrgBrand
    offers?: SchemaOrgOffer | SchemaOrgOffer[]
  }
  
  export interface ProductSchema extends BaseSchema {
    '@type': 'Product'
    sku?: string
    offers?: SchemaOrgOffer | SchemaOrgOffer[]
  }
  
  export interface CollectionPageSchema extends BaseSchema {
    '@type': 'CollectionPage'
  }
  