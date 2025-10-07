// composables/useCategoriasNav.ts
import { useAsyncData } from '#app'

// Nota: queryCollectionNavigation está auto-importado por @nuxt/content
// y permite where() + order() + selección de campos.
type CategoriaNode = {
  id?: string
  slug?: string
  title?: string
  nav?: string
  order?: number
  path?: string | null
  hidden?: boolean
  featured?: boolean
  image?: string
  children?: CategoriaNode[]
}

export function useCategoriasNav() {
  return useAsyncData('categorias:nav', async () => {
    // Árbol navegable de la colección "categorias"
    // Filtramos ocultas y ordenamos por `order`, tal como permite la utilidad
    // (patrón recomendado por la doc).
    // https://content.nuxt.com/docs/utils/query-collection-navigation
    // @ts-expect-error auto-import
    const treeRaw = await queryCollectionNavigation(
      'categorias',
      ['id','slug','title','nav','order','image','featured','hidden','path']
    )
      .where('hidden', '!=', true)
      .order('order', 'ASC')

    // Sanitiza paths (nada de /api/*)
    const sanitizePath = (p?: string | null, slug?: string | null) =>
      !p ? (slug ? `/categorias/${slug}` : null) : (p.startsWith('/api/') ? null : p)

    const normalize = (nodes: CategoriaNode[]): CategoriaNode[] =>
      (nodes || []).map(n => ({
        ...n,
        path: sanitizePath(n.path, n.slug || null),
        children: n.children?.length ? normalize(n.children) : []
      }))

    const tree = normalize(treeRaw)

    // Si tu contenido tiene un “root” contenedor, saca sus hijas como top-level (barra horizontal)
    const categoriesTop = Array.isArray(tree) && tree.length === 1 && Array.isArray(tree[0]?.children)
      ? tree[0].children!
      : tree

    return { tree: categoriesTop }
  }, {
    server: true,
    default: () => ({ tree: [] }),
    dedupe: 'defer'
  })
}
