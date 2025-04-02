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
}
