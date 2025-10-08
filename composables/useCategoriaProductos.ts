// composables/useCategoriaProductos.ts
import { computed, unref, type MaybeRef } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData } from '#app'

type Options = {
  limit?: number
  page?: number
  sort?: 'order' | 'title' | 'price'
  direction?: 'ASC' | 'DESC'
  categorySlug?: MaybeRef<string>        // si no viene, lo toma de la ruta [/categorias/[slug]]
  includeSubcategory?: boolean           // también trae por subcategorySlug (default true)
  q?: MaybeRef<string>                   // filtro cliente (título/desc) — opcional
}

export type ProductListItem = {
  id?: string
  slug?: string
  title?: string
  order?: number
  price?: number
  image?: string
  excerpt?: string
  description?: string
  path?: string | null
  categorySlug?: string
  subcategorySlug?: string
  tags?: string[]
  hidden?: boolean
}

export type ProductsPayload = {
  items: ProductListItem[]
  total: number
  page: number
  pages: number
  limit: number
  sort: 'order' | 'title' | 'price'
  direction: 'ASC' | 'DESC'
}

export function useCategoriaProductos (opts: Options = {}) {
  const route = useRoute()

  const limit = Math.max(1, Math.min(100, opts.limit ?? 24))
  const page = Math.max(1, Math.floor(opts.page ?? 1))
  const sort = (opts.sort ?? 'order')
  const direction = (opts.direction ?? 'ASC').toUpperCase() as 'ASC' | 'DESC'
  const includeSub = opts.includeSubcategory ?? true
  const qClient = computed(() => String(unref(opts.q || '')).trim().toLowerCase())

  const routeSlug = computed(() => {
    const p = route.params.slug
    const s = Array.isArray(p) ? p.join('/') : String(p || '')
    return s.replace(/^\/+|\/+$/g, '')
  })
  const categorySlug = computed(() => (opts.categorySlug ? unref(opts.categorySlug) : routeSlug.value))

  const key = () => `cat:products:qcol:${categorySlug.value}:${includeSub}:${limit}:${page}:${sort}:${direction}`

  return useAsyncData<ProductsPayload>(
    key,
    async () => {
      const slug = categorySlug.value
      if (!slug) return { items: [], total: 0, page, pages: 0, limit, sort, direction }

      // Builder base — Nuxt Content queryCollection (where/order/skip/limit/all/count) 
      // Docs API: queryCollection & count/where en Content. :contentReference[oaicite:1]{index=1}
      const base = () =>
        queryCollection('productos')
          .where('hidden', '!=', true)
          .where('categorySlug', '=', slug)

      // Si queremos incluir subcategoría, clonamos condición OR
      // (algunas versiones usan .orWhere; si no existe, haz dos queries y mergea)
      let builder = base().order(sort, direction)
      try {
        // @ts-expect-error algunas versiones exponen orWhere
        if (includeSub) builder = builder.orWhere('subcategorySlug', '=', slug)
      } catch { /* fallback abajo */ }

      // Conteo robusto (count puede no estar en todas las versiones)
      let total = 0
      try {
        total = await builder.count()
      } catch {
        // Fallback: contar IDs
        const ids = await (includeSub
          ? // @ts-expect-error
            base().orWhere('subcategorySlug', '=', slug).select('id').all()
          : base().select('id').all()
        )
        total = Array.isArray(ids) ? ids.length : 0
      }

      const pages = total ? Math.max(1, Math.ceil(total / limit)) : 0
      const currentPage = Math.min(page, Math.max(1, pages || 1))
      const offset = (currentPage - 1) * limit

      const fields = ['id','slug','title','order','price','image','excerpt','description','hidden','categorySlug','subcategorySlug','path','tags'] as const
      const raw = await (async () => {
        // si no existe orWhere, hacemos merge manual
        if (includeSub && !(builder as any)?.orWhere) {
          // @ts-expect-error
          const a = await base().select(...fields).all()
          // @ts-expect-error
          const b = await queryCollection('productos')
            .where('hidden','!=',true)
            .where('subcategorySlug','=',slug)
            .order(sort, direction)
            .select(...fields).all()
          // merge y orden simple en memoria
          const merged = [...(a || []), ...(b || [])]
          merged.sort((x:any, y:any) => {
            if (sort === 'title') return String(x.title||'').localeCompare(String(y.title||''))
            if (sort === 'price') return (Number(x.price||0) - Number(y.price||0)) * (direction === 'ASC' ? 1 : -1)
            return (Number(x.order||0) - Number(y.order||0)) * (direction === 'ASC' ? 1 : -1)
          })
          return merged.slice(offset, offset + limit)
        }
        return await builder.select(...fields).skip(offset).limit(limit).all()
      })()

      const items: ProductListItem[] = (raw || []).map((p: any) => ({
        ...p,
        // saneo de path: evita rutas /api y garantiza fallback /productos/slug
        path: p?.path?.startsWith?.('/api/')
          ? (p.slug ? `/productos/${p.slug}` : null)
          : (p?.path || (p?.slug ? `/productos/${p.slug}` : null)),
        image: p?.image || '/img/placeholder-product.jpg'
      }))

      // Filtro cliente (búsqueda rápida por título/desc)
      const filtered = qClient.value
        ? items.filter(it =>
            String(it.title||'').toLowerCase().includes(qClient.value) ||
            String(it.excerpt||it.description||'').toLowerCase().includes(qClient.value)
          )
        : items

      return { items: filtered, total, page: currentPage, pages, limit, sort, direction }
    },
    {
      server: true,
      default: () => ({ items: [], total: 0, page, pages: 0, limit, sort, direction }),
      watch: [categorySlug]
    }
  )
}
