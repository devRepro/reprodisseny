// composables/useCategoriasNav.ts
import { useAsyncData } from '#app'

export type CategoriaNode = {
  id?: string
  slug?: string
  title?: string
  nav?: string
  order?: number
  path?: string | null
  image?: string
  children?: CategoriaNode[]
  products?: ProductoNode[]
}

export type ProductoNode = {
  id?: string
  slug?: string
  title: string
  description?: string
  image?: string
  categorySlug: string
  path?: string | null
  order?: number
}

type Options = {
  includeProducts?: boolean
  productLimit?: number
  leafOnly?: boolean
  debug?: boolean
}

type ReturnShape = {
  tree: CategoriaNode[]
  indexBySlug: Record<string, CategoriaNode>
  menuItems: Array<{ title: string; slug?: string; path?: string | null; hasChildren: boolean }>
}

export function useCategoriasNav (opts: Options = {}) {
  const {
    includeProducts = true,
    productLimit = 6,
    leafOnly = true,
    debug = false
  } = opts

  return useAsyncData<ReturnShape>('categorias:nav', async () => {
    // 1) árbol de categorías (no pedir 'children' ni 'type' aquí)
    // @ts-expect-error auto-import (@nuxt/content)
    const rawTree = await queryCollectionNavigation(
      'categorias',
      ['id','slug','title','nav','order','image','path']
    ).order('order', 'ASC')

    const sanitizePath = (p?: string | null, slug?: string | null, base = '/categorias') =>
      !p ? (slug ? `${base}/${slug}` : null) : (p.startsWith('/api/') ? null : p)

    const normalize = (nodes: CategoriaNode[] = []): CategoriaNode[] =>
      nodes.map(n => ({
        ...n,
        path: sanitizePath(n.path, n.slug),
        children: n.children?.length ? normalize(n.children) : []
      }))

    const tree0 = normalize(rawTree)
    const top =
      Array.isArray(tree0) && tree0.length === 1 && Array.isArray(tree0[0]?.children)
        ? (tree0[0].children as CategoriaNode[])
        : tree0

    // 2) si no quieres productos, devolvemos índices básicos y listo
    if (!includeProducts) {
      const { indexBySlug, menuItems } = buildIndexes(top)
      if (debug) console.debug('[useCategoriasNav] sin productos', { count: menuItems.length })
      return { tree: top, indexBySlug, menuItems }
    }

    // 3) slugs para traer productos
    const slugs: string[] = []
    walk(top, n => { if (n.slug) slugs.push(n.slug) })

    // 4) traer productos: preferimos IN, con fallback por lotes si no está soportado
    let products: ProductoNode[] = []
    if (slugs.length) {
      try {
        // @ts-expect-error auto-import
        products = await queryCollection('productos')
          .where('categorySlug', 'IN', slugs)
          .order('order', 'ASC')
          .all()
      } catch (e) {
        // Fallback por lotes de 20 (evita N+1 grande)
        const chunks: string[][] = chunk(slugs, 20)
        const results: ProductoNode[][] = []
        // @ts-expect-error auto-import
        for (const subset of chunks) {
          // Algunos builds soportan múltiples ORs con .where encadenado:
          let q = queryCollection('productos').order('order', 'ASC')
          subset.forEach((s, i) => {
            q = i === 0 ? q.where('categorySlug', '=', s) : q.orWhere('categorySlug', '=', s)
          })
          // @ts-expect-error
          results.push(await q.all())
        }
        products = results.flat()
      }
    }

    const sanitizeProdPath = (p?: string | null, slug?: string | null) =>
      sanitizePath(p, slug, '/productos')

    products = (products || []).map(p => ({
      ...p,
      path: sanitizeProdPath(p.path, p.slug)
    }))

    const bySlug = groupBy(products, p => p.categorySlug)

    const attach = (nodes: CategoriaNode[]) => {
      for (const n of nodes) {
        const isLeaf = !(n.children && n.children.length)
        if (!leafOnly || isLeaf) {
          const list = n.slug ? (bySlug[n.slug] || []) : []
          n.products = productLimit > 0 ? list.slice(0, productLimit) : list
        }
        if (n.children?.length) attach(n.children)
      }
    }
    attach(top)

    const { indexBySlug, menuItems } = buildIndexes(top)

    if (debug) {
      console.groupCollapsed('[useCategoriasNav] resumen')
      console.table(top.map(n => ({
        title: n.nav || n.title,
        slug: n.slug,
        children: n.children?.length ?? 0,
        products: n.products?.length ?? 0
      })))
      console.groupEnd()
    }

    return { tree: top, indexBySlug, menuItems }
  }, {
    server: true,
    default: () => ({ tree: [], indexBySlug: {}, menuItems: [] }),
    dedupe: 'defer'
  })
}

/* ---------------- utils ---------------- */

function walk(nodes: CategoriaNode[], fn: (n: CategoriaNode) => void) {
  for (const n of nodes) {
    fn(n)
    if (n.children?.length) walk(n.children, fn)
  }
}

function groupBy<T>(arr: T[], keyFn: (t: T) => string | undefined) {
  const out: Record<string, T[]> = {}
  for (const it of arr) {
    const k = keyFn(it)
    if (!k) continue
    if (!out[k]) out[k] = []
    out[k].push(it)
  }
  return out
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function buildIndexes(tree: CategoriaNode[]) {
  const indexBySlug: Record<string, CategoriaNode> = {}
  const menuItems: Array<{ title: string; slug?: string; path?: string | null; hasChildren: boolean }> = []

  walk(tree, (n) => {
    if (n.slug) indexBySlug[n.slug] = n
    menuItems.push({
      title: n.nav || n.title || n.slug || '(sin título)',
      slug: n.slug,
      path: n.path,
      hasChildren: !!(n.children && n.children.length)
    })
  })

  return { indexBySlug, menuItems }
}
