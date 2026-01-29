// types/cms.ts

export type CmsHreflang = { lang: string; url: string }
export type CmsFaq = { question: string; answer: string }
export type CmsBreadcrumb = { name: string; url: string }
export type CmsCta = { text: string; link: string }

export type CmsImage = {
  src: string
  width?: number
  height?: number
  alt?: string
}

export type CmsSeo = {
  metaTitle?: string
  metaDescription?: string
  canonical?: string
  hreflang?: CmsHreflang[]
  keywords?: string[]
  searchTerms?: string[]
  schema?: Record<string, any>

  // Control fino (opcionales, si los añades en SP)
  noindex?: boolean
  robotsOverride?: "index,follow" | "noindex,follow" | "noindex,nofollow" | "index,nofollow"
  ogImage?: CmsImage
}

export type CmsBase = {
  id: string // SharePoint listItem.id (string)
  title: string
  slug: string

  isPublished: boolean
  publishedAt?: string // ISO

  description?: string
  bodyMd?: string

  image?: CmsImage
  alt?: string
  galleryImages?: (string | CmsImage)[] // igual que en tus MD

  seo: CmsSeo

  // Congela la URL para no romper SEO/Ads (recomendado añadir en SP)
  path?: string

  // Para futuros 301 (recomendado añadir en SP)
  legacySlugs?: string[]
}

export type CmsCategory = CmsBase & {
  type: "categoria" | "subcategoria"
  nav?: string
  order: number
  parent?: string
  hidden: boolean
  featured: boolean

  breadcrumbs?: CmsBreadcrumb[]
  cta?: CmsCta
  faqs?: CmsFaq[]
}

export type CmsProduct = CmsBase & {
  type: "producto"
  categorySlug: string
  subcategorySlug?: string

  shortDescription?: string
  order: number

  // Comercio
  sku?: string
  mpn?: string
  gtin13?: string
  brand?: string
  price?: number
  priceCurrency?: string
  inStock?: boolean

  // Opiniones
  ratingValue?: number
  reviewCount?: number

  // Atributos/variantes/form
  attributes?: { name: string; value: string }[]
  variants?: any[]
  formFields?: any[]

  // Multi-categoría “sin Lookup” (recomendado añadir en SP)
  extraCategorySlugs?: string[]
}

export type CmsCatalog = {
  generatedAt: string
  categories: CmsCategory[]
  products: CmsProduct[]

  // índices para performance en runtime (opcionales, pero muy útiles)
  categoryBySlug: Record<string, CmsCategory>
  productBySlug: Record<string, CmsProduct>
  productsByCategorySlug: Record<string, string[]> // guarda slugs de producto
}
