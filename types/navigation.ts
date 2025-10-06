// types/navigation.ts
import type { Categoria } from './catalog'

/** Nodo mínimo para navegación/menús (usa tus campos reales) */
export interface CategoriaNodeNav {
  slug?: string
  path?: string
  title?: string
  nav?: string | null
  order?: number
  hidden?: boolean
  image?: string
  description?: string
  featured?: boolean
  children?: CategoriaNodeNav[]
  parentId?: string | null
}

export interface CategoriasPayload {
  tree: CategoriaNodeNav[]
  indexById: Record<string, CategoriaNodeNav>
}

export interface CategoriasHomePayload {
  items: CategoriaNodeNav[]
}

/** Breadcrumb muy simple (puedes ampliarlo si quieres) */
export interface Breadcrumb {
  title?: string
  path: string
}
