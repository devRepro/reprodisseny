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
  category?: string
  categorySlug?: string
  subcategorySlug?: string
  path?: string | null
  order?: number
}

type Options = { productLimit?: number; debug?: boolean }
type ReturnShape = {
  tree: CategoriaNode[]
  indexBySlug: Record<string, CategoriaNode>
  menuItems: Array<{ title: string; slug?: string; path?: string | null; hasChildren: boolean }>
}

export function useCategoriasNav (opts: Options = {}) {
  const { productLimit = 6, debug = false } = opts

  return useAsyncData<ReturnShape>('categorias:nav', async () => {
    // --- 1) categorías ---
    // @ts-expect-error auto-import
    const raw = await queryCollectionNavigation('categorias', ['id','slug','title','nav','order','image','path'])
      .order('order','ASC')

    const norm = (s?: string | null) => (s || '').toString().trim().toLowerCase()
    const lastSeg = (s?: string | null) => {
      const t = norm(s).split('/').filter(Boolean); return t[t.length - 1] || ''
    }
    const depthFromPath = (p?: string | null) => {
      const z = (p || '').replace(/^\/+|\/+$/g,'')
      const rest = z.startsWith('categorias/') ? z.slice('categorias/'.length) : z
      return rest.split('/').filter(Boolean).length
    }
    const sanitizePath = (p?: string | null, slug?: string | null, base='/categorias') =>
      !p ? (slug ? `${base}/${slug}` : null) : (p.startsWith('/api/') ? null : p)
    const sanitizeProdPath = (p?: string | null, slug?: string | null) =>
      sanitizePath(p, slug, '/productos')

    const normalize = (nodes: CategoriaNode[] = []): CategoriaNode[] =>
      nodes.map(n => ({
        ...n,
        path: sanitizePath(n.path, n.slug),
        children: n.children?.length ? normalize(n.children) : []
      }))

    const collapseMirrors = (nodes: CategoriaNode[]): CategoriaNode[] => {
      return nodes.map(n => {
        let kids = (n.children || []).map(k => ({ ...k }))
        // 1) elimina hijos cuyo slug o lastSeg coincida con el del padre
        const ps = norm(n.slug); const pp = lastSeg(n.path)
        kids = kids.filter(k => !(norm(k.slug) === ps || lastSeg(k.path) === pp))
        // 2) colapsa cadenas espejo (un solo hijo y coincide igualmente)
        if (kids.length === 1) {
          const k = kids[0]
          const same = norm(k.slug) === ps || lastSeg(k.path) === pp
          if (same) {
            // sube nietos y (si tuviera) products
            const merged: CategoriaNode = {
              ...n,
              products: n.products?.length ? n.products : k.products,
              children: k.children?.length ? collapseMirrors(k.children) : []
            }
            return merged
          }
        }
        return { ...n, children: kids.length ? collapseMirrors(kids) : [] }
      })
    }

    const t0 = normalize(raw)
    const root = Array.isArray(t0) && t0.length === 1 && t0[0].children ? t0[0].children! : t0
    const tree = collapseMirrors(root)

    // --- 2) productos (TODO en memoria; sin SQL complejo) ---
    // @ts-expect-error auto-import
    const all: ProductoNode[] = await queryCollection('productos').order('order','ASC').all()
    const prods = (all || []).map(p => {
      const kCat = norm(p.categorySlug) || norm(p.category)
      const kSub = norm(p.subcategorySlug)
      return {
        ...p,
        categorySlug: kCat || p.categorySlug,
        subcategorySlug: kSub || p.subcategorySlug,
        path: sanitizeProdPath(p.path, p.slug),
        __kCat: kCat,
        __kSub: kSub
      } as ProductoNode & { __kCat: string; __kSub: string }
    })

    const groupBy = <T,>(arr: T[], key: (t:T)=>string) => {
      const out: Record<string, T[]> = {}
      for (const it of arr) {
        const k = key(it); if (!k) continue
        ;(out[k] ||= []).push(it)
      }
      return out
    }

    const byCat = groupBy(prods, p => p.__kCat)  // categorías simples (depth=1)
    const bySub = groupBy(prods, p => p.__kSub)  // subcategorías (depth=2)

    // --- 3) adjuntar SOLO a hojas (tras colapsar espejos) ---
    const attach = (nodes: CategoriaNode[]) => {
      for (const n of nodes) {
        const isLeaf = !(n.children && n.children.length)
        if (isLeaf) {
          const d = depthFromPath(n.path)
          const s1 = norm(n.slug); const s2 = lastSeg(n.path)
          let list: ProductoNode[] = []
          if (d === 2) {
            list = [
              ...(s1 ? (bySub[s1] || []) : []),
              ...(s2 && s2 !== s1 ? (bySub[s2] || []) : [])
            ]
          } else {
            list = [
              ...(s1 ? (byCat[s1] || []) : []),
              ...(s2 && s2 !== s1 ? (byCat[s2] || []) : [])
            ]
          }
          n.products = productLimit > 0 ? list.slice(0, productLimit) : list
        }
        if (n.children?.length) attach(n.children)
      }
    }
    attach(tree)

    // --- 4) índices auxiliares ---
    const indexBySlug: Record<string, CategoriaNode> = {}
    const menuItems: Array<{ title: string; slug?: string; path?: string | null; hasChildren: boolean }> = []
    const walk = (ns: CategoriaNode[]) => {
      for (const n of ns) {
        if (n.slug) indexBySlug[n.slug] = n
        menuItems.push({
          title: n.nav || n.title || n.slug || '(sin título)',
          slug: n.slug,
          path: n.path,
          hasChildren: !!(n.children && n.children.length)
        })
        if (n.children?.length) walk(n.children)
      }
    }
    walk(tree)

    if (debug) {
      console.groupCollapsed('[useCategoriasNav] resumen')
      const rows: any[] = []
      const walk2 = (ns: CategoriaNode[]) => {
        for (const n of ns) {
          rows.push({
            depth: depthFromPath(n.path),
            title: n.nav || n.title,
            slug: n.slug,
            lastSeg: lastSeg(n.path),
            children: n.children?.length ?? 0,
            products: n.products?.length ?? 0
          })
          if (n.children?.length) walk2(n.children)
        }
      }
      walk2(tree)
      console.table(rows)
      console.log('bySub keys:', Object.keys(bySub))
      console.log('byCat  keys:', Object.keys(byCat))
      console.groupEnd()
    }

    return { tree, indexBySlug, menuItems }
  }, {
    server: true,
    default: () => ({ tree: [], indexBySlug: {}, menuItems: [] }),
    dedupe: 'defer'
  })
}
