export type CmsImage = {
    src: string
    alt?: string
    width?: number
    height?: number
  } | null
  
  export type CmsBreadcrumb = {
    name: string
    url: string
  }
  
  export type CmsSeo = {
    metaTitle?: string
    metaDescription?: string
    canonical?: string
    robotsOverride?: string
    keywords?: string[]
    hreflang?: Array<{ lang: string; url: string }>
    schema?: Record<string, any> | null
  }
  
  export type CmsCategory = {
    id: string
    type: "categoria" | "subcategoria"
    slug: string
    path: string
    title: string
    nav: string
    order: number
    hidden: boolean
    featured: boolean
    isPublished: boolean
    parentSlug?: string | null
    parentPath?: string | null
    description?: string
    bodyMd?: string
    tabs?: Array<{ id: string; title: string; blocks: any[] }>
    image: CmsImage
    cta?: { text?: string; link?: string } | null
    faqs?: Array<{ question: string; answer: string }>
    galleryImages?: CmsImage[]
    breadcrumbs?: CmsBreadcrumb[]
    legacySlugs?: string[]
    seo?: CmsSeo
    updatedAt?: string
  }
  
  export type CmsProduct = {
    id: string
    type: "producto"
    slug: string
    path: string
    title: string
    nav?: string
    sku?: string
    categorySlug?: string | null
    categoryPath?: string | null
    subcategorySlug?: string | null
    subcategoryPath?: string | null
    order: number
    hidden: boolean
    featured: boolean
    isPublished: boolean
    description?: string
    bodyMd?: string
    image: CmsImage
    galleryImages?: CmsImage[]
    breadcrumbs?: CmsBreadcrumb[]
    seo?: CmsSeo
    updatedAt?: string
  }
  
  export type HomeCategoryCardDto = {
    id: string
    slug: string
    title: string
    href: string
    image: CmsImage
    order: number
  }