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

type Options = { productLimit?: number; includeProducts?: boolean }

type ReturnShape = {
  tree: CategoriaNode[]
  indexBySlug: Record<string, CategoriaNode>
  menuItems: CategoriaNode[]
}

export function useCategoriasNav(opts: Options = {}) {
  const productLimit = opts.productLimit ?? 6
  const includeProducts = opts.includeProducts ?? false

  return useAsyncData<ReturnShape>(
    `cms:catalog:${includeProducts ? "catalog" : "nav"}:${productLimit}`,
    () =>
      $fetch("/api/cms/catalog", {
        query: {
          mode: includeProducts ? "catalog" : "nav",
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
