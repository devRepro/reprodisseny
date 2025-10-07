// composables/useCategoriaProductos.ts
import { computed, unref, type MaybeRef } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData } from '#app'
// `queryCollection` está auto-importado por Nuxt Content (no hace falta import explícito)

type Options = {
  limit?: number
  page?: number
  sort?: 'order' | 'title' | 'price'
  direction?: 'ASC' | 'DESC'
  categorySlug?: MaybeRef<string>
}

type ProductListItem = {
  id?: string
  slug?: string
  title?: string
  order?: number
  price?: number
  image?: string
  excerpt?: string
  path?: string | null
  categorySlug: string
  hidden?: boolean
}

type ProductsPayload = {
  items: ProductListItem[]
  total: number
}

export function useCategoriaProductos(opts: Options = {}) {
  const route = useRoute()

  const limit = Math.max(1, Math.min(100, opts.limit ?? 24))
  const page = Math.max(1, opts.page ?? 1)
  const sort = (opts.sort ?? 'order')
  const direction: 'ASC' | 'DESC' = (opts.direction ?? 'ASC').toUpperCase() as any

  const routeSlug = computed(() => {
    const p = route.params.slug
    const s = Array.isArray(p) ? p.join('/') : String(p || '')
    return s.replace(/^\/+|\/+$/g, '')
  })
  const categorySlug = computed(() => (opts.categorySlug ? unref(opts.categorySlug) : routeSlug.value))

  const key = () => `cat:products:qcol:${categorySlug.value}:${limit}:${page}:${sort}:${direction}`

  return useAsyncData<ProductsPayload>(
    key,
    async () => {
      const slug = categorySlug.value
      if (!slug) return { items: [], total: 0 }

      // Builder base según docs (where/order/skip/limit/all)
      const base = () =>
        // @ts-expect-error auto-import de Nuxt Content
        queryCollection('productos')
          .where('hidden', '!=', true)
          .where('categorySlug', '=', slug)
          .order(sort, direction)

      // total oficial (count existe en la API de queryCollection)
      // si tu versión no lo tuviera, se puede hacer un .select('id').all().length
      let total = 0
      try {
        // @ts-expect-error: count forma parte del builder oficial
        total = await base().count()
      } catch {
        const ids = await base().select('id').all()
        total = Array.isArray(ids) ? ids.length : 0
      }

      const offset = (page - 1) * limit
      const fields = ['id','slug','title','order','price','image','excerpt','hidden','categorySlug','path'] as const

      const raw = await base().select(...fields).skip(offset).limit(limit).all()
      const items = (raw || []).map((p: any) => ({
        ...p,
        path: p.path?.startsWith?.('/api/')
          ? (p.slug ? `/productos/${p.slug}` : null)
          : (p.path || (p.slug ? `/productos/${p.slug}` : null))
      }))

      return { items, total }
    },
    { server: true, default: () => ({ items: [], total: 0 }), watch: [categorySlug] }
  )
}
