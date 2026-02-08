// composables/useCategoriasNav.ts
import { useAsyncData } from "#app"

export type CategoriaNode = {
  id?: string
  slug?: string
  title?: string
  nav?: string
  order?: number
  path?: string | null
  image?: string | null
  parent?: string | null
  children?: CategoriaNode[]
  products?: ProductoNode[]
}

export type ProductoNode = {
  id?: string
  slug?: string
  title: string
  path?: string | null
  image?: string | null
  order?: number
}

type Options = {
  productLimit?: number
  includeProducts?: boolean
  mode?: "nav" | "catalog"
}

type ReturnShape = {
  tree: CategoriaNode[]
  indexBySlug: Record<string, CategoriaNode>
  menuItems: CategoriaNode[]
}

export function useCategoriasNav(opts: Options = {}) {
  const productLimit = opts.productLimit ?? 6
  const includeProducts = opts.includeProducts ?? false
  const mode = opts.mode ?? "nav"

  return useAsyncData<ReturnShape>(
    `cms:catalog:${mode}:ip${includeProducts ? 1 : 0}:pl${productLimit}`,
    () =>
      $fetch("/api/cms/catalog", {
        query: {
          mode,
          includeProducts: includeProducts ? 1 : 0,
          productLimit,
        },
      }),
    {
      server: true,
      default: () => ({ tree: [], indexBySlug: {}, menuItems: [] }),
      dedupe: "defer",
    }
  )
}
