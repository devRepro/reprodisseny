

export type NavItem = { label: string; to: string }

export type MediaImage = {
  src: string
  width?: number
  height?: number
  alt?: string
}

export type CategoryDoc = {
  type: "categoria"
  title: string
  nav?: string
  order?: number
  parent?: string
  featured?: boolean
  hidden?: boolean
  description?: string
  image?: MediaImage
  galleryImages?: any[]
  breadcrumbs?: { name: string; url: string }[]
  cta?: { text: string; link: string }
  metaTitle?: string
  metaDescription?: string
  faqs?: { question: string; answer: string }[]
  _path?: string
}

export type ProductDoc = {
  type: "producto"
  slug?: string
  categorySlug: string
  title: string
  description?: string
  image?: MediaImage
  galleryImages?: any[]
  inStock?: boolean
  price?: number
  priceCurrency?: string
  ratingValue?: number
  reviewCount?: number
  attributes?: { name: string; value: string }[]
  variants?: any[]
  formFields?: any[]
  faqs?: { question: string; answer: string }[]
  _path?: string
}

function normalizePath(p?: string) {
  if (!p) return "/"
  return p.endsWith("/index") ? p.slice(0, -"/index".length) : p
}

export async function getCategories(): Promise<CategoryDoc[]> {
  return await queryContent<CategoryDoc>("/categorias")
    .where({ type: "categoria", hidden: { $ne: true } })
    .sort({ order: 1 })
    .find()
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDoc | null> {
  const doc = await queryContent<CategoryDoc>(`/categorias/${slug}`)
    .where({ type: "categoria" })
    .findOne()

  return doc ?? null
}

export async function getProductsByCategorySlug(categorySlug: string): Promise<ProductDoc[]> {
  return await queryContent<ProductDoc>("/productos")
    .where({ type: "producto", categorySlug, inStock: { $ne: false } })
    .sort({ title: 1 })
    .find()
}

export async function getProductBySlug(slug: string): Promise<ProductDoc | null> {
  const doc = await queryContent<ProductDoc>(`/productos/${slug}`)
    .where({ type: "producto" })
    .findOne()

  return doc ?? null
}

export async function getNavItemsFromCategories(): Promise<NavItem[]> {
  const cats = await getCategories()
  return cats.map((c) => ({
    label: c.nav?.trim() || c.title,
    to: normalizePath(c._path),
  }))
}

export function mapCategoriesToCards(categories: CategoryDoc[]) {
  return categories.map((c) => ({
    label: c.title,
    to: normalizePath(c._path),
    image: c.image?.src || "",
  }))
}

export function mapProductsToCircleActions(products: ProductDoc[]) {
  return products.map((p) => ({
    label: p.title,
    to: normalizePath(p._path),
    image: p.image?.src || "",
  }))
}
                                            