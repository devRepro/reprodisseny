import { computed } from "vue"
import type {
  NavCategoryItem,
  NavProductItem,
} from "~/server/services/catalog.service"

export type ProductoNode = NavProductItem
export type CategoriaNode = NavCategoryItem

type Options = {
  productLimit?: number
}

type ReturnShape = {
  tree: CategoriaNode[]
  indexBySlug: Record<string, CategoriaNode>
  menuItems: CategoriaNode[]
}

export function useCategoriasNav(opts: Options = {}) {
  const productLimit = Math.max(0, Math.min(opts.productLimit ?? 8, 12))

  const request = useFetch<ReturnShape>("/api/nav/categorias", {
    key: `nav-categorias:pl${productLimit}`,
    query: { productLimit },
    server: true,
    lazy: false,
    dedupe: "defer",
    default: () => ({
      tree: [],
      indexBySlug: {},
      menuItems: [],
    }),
  })

  const tree = computed(() => request.data.value?.tree ?? [])
  const indexBySlug = computed(() => request.data.value?.indexBySlug ?? {})
  const menuItems = computed(() => request.data.value?.menuItems ?? [])

  return {
    ...request,
    tree,
    indexBySlug,
    menuItems,
  }
}