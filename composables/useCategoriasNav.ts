// composables/useCategoriasNav.ts
import { useAsyncData } from '#app'

export type CategoriaNode = {
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

type Options = { debug?: boolean }

export function useCategoriasNav(opts: Options = {}) {
  const debug = !!opts.debug

  return useAsyncData('categorias:nav', async () => {
    
  
    const rawTree = await queryCollectionNavigation(
      'categorias',
      // Solo campos que sí existen en el índice
      ['id','slug','title','nav','order','image','featured','hidden','path']
    )
      .order('order', 'ASC')         // ok: 'order' existe si lo defines

    // Normaliza path:
    const sanitizePath = (p?: string | null, slug?: string | null) =>
      !p ? (slug ? `/categorias/${slug}` : null) : (p.startsWith('/api/') ? null : p)

    const normalize = (nodes: CategoriaNode[] = []): CategoriaNode[] =>
      nodes.map(n => ({
        ...n,
        path: sanitizePath(n.path, n.slug || null),
        children: n.children?.length ? normalize(n.children) : []
      }))

    const tree = normalize(rawTree)

    // Si hay un root contenedor único, saca sus hijas como top-level
    const top =
      Array.isArray(tree) && tree.length === 1 && Array.isArray(tree[0]?.children)
        ? (tree[0].children as CategoriaNode[])
        : tree

    // Chivatos (server + client)
    if (debug) {
      const label = '[useCategoriasNav] top'
      if (process.server) {
        // eslint-disable-next-line no-console
        console.log(label, JSON.stringify(top, null, 2))
      } else {
        // eslint-disable-next-line no-console
        console.groupCollapsed(label)
        // eslint-disable-next-line no-console
        console.table(
          top.map(n => ({
            title: n.nav || n.title,
            slug: n.slug,
            path: n.path,
            children: n.children?.length ?? 0
          }))
        )
        // eslint-disable-next-line no-console
        console.log(top)
        // eslint-disable-next-line no-console
        console.groupEnd()
      }
    }

    return { tree: top }
  }, {
    server: true,
    default: () => ({ tree: [] }),
    dedupe: 'defer'
  })
}

