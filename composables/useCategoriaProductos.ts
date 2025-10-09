import { computed, toValue } from 'vue'
import { useRoute } from 'vue-router'

type Options = {
  limit?: number
  page?: number
  sort?: 'order' | 'title' | 'price'
  direction?: 'ASC' | 'DESC'
  q?: string | Ref<string>
  includeSubcategory?: boolean
  categorySlug?: string | string[]
}

export function useCategoriaProductos(opts: Options = {}) {
  const route = useRoute()
  const limit = opts.limit ?? 24
  const page = opts.page ?? 1
  const sort = opts.sort ?? 'order'
  const direction = (opts.direction ?? 'ASC').toUpperCase() as 'ASC' | 'DESC'
  const includeSubcategory = opts.includeSubcategory ?? true

  const slug = computed(() => {
    const raw = opts.categorySlug ?? route.params.slug
    const s = Array.isArray(raw) ? raw.join('/') : String(raw || '')
    return s.replace(/^\/+|\/+$/g, '')
  })

  const key = computed(() =>
    `productos:categoria:${slug.value}:${limit}:${page}:${sort}:${direction}:${toValue(opts.q) || ''}:${includeSubcategory}`
  )

  const { data, pending, error, refresh } = useAsyncData(
    key,
    () => $fetch(`/api/categorias/${slug.value}/products`, {
      params: {
        limit, page, sort, direction,
        includeSubcategory,
        q: toValue(opts.q) || ''
      }
    }),
    {
      server: true,
      default: () => ({ items: [], page: 1, pages: 0, total: 0, limit })
    }
  )

  const items = computed(() => data.value?.items ?? [])
  const meta = computed(() => ({
    page: data.value?.page ?? 1,
    pages: data.value?.pages ?? 0,
    total: data.value?.total ?? 0,
    limit: data.value?.limit ?? limit
  }))

  return { items, meta, pending, error, refresh }
}
