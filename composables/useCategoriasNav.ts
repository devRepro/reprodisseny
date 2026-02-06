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

type Options = { productLimit?: number; includeProducts?: boolean; debug?: boolean }

type ReturnShape = {
  tree: CategoriaNode[]
  indexBySlug: Record<string, CategoriaNode>
  menuItems: CategoriaNode[]
}

export function useCategoriasNav(opts: Options = {}) {
  const productLimit = opts.productLimit ?? 6
  const includeProducts = opts.includeProducts ?? true
  const debug = !!opts.debug

  return useAsyncData<ReturnShape>(
    `categorias:nav:${productLimit}:${includeProducts ? 1 : 0}:${debug ? 1 : 0}`,
    () =>
      $fetch("/api/cms/nav", {
        params: { productLimit, includeProducts, debug },
      }),
    {
      server: true,
      default: () => ({ tree: [], indexBySlug: {}, menuItems: [] }),
      dedupe: "defer",
    }
  )
}
