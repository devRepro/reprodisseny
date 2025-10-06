// composables/useCategoriaProductos.ts
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { ProductsPayload, ProductListItem } from '@/types'

type Options = {
  limit?: number
  page?: number
  sort?: 'order' | 'title'
  direction?: 'ASC' | 'DESC'
}

export function useCategoriaProductos(opts: Options = {}) {
  const route = useRoute()
  const limit = opts.limit ?? 24
  const page = opts.page ?? 1
  const sort = opts.sort ?? 'order'
  const direction = (opts.direction ?? 'ASC').toUpperCase() as 'ASC' | 'DESC'

  const slug = computed(() => {
    const raw = Array.isArray(route.params.slug)
      ? route.params.slug.join('/')
      : String(route.params.slug || '')
    return raw.replace(/^\/+|\/+$/g, '')
  })

  const key = computed(
    () => `cat:products:${slug.value}:${limit}:${page}:${sort}:${direction}`
  )

  return useAsyncData<ProductsPayload>(
    key.value,
    async () => {
      const base = `/categorias/${slug.value}`

      // ✅ Usamos la colección 'categorias' y filtramos por carpeta
      let q = queryCollection('categorias')
        .where('path', 'LIKE', `${base}/%`)     // documentos dentro de la carpeta
        .where('file', '!=', 'index.md')        // excluye el index.md de la categoría
        .select('title', 'description', 'image', 'alt', 'path', 'order', 'slug')
        .order(sort, direction)

      const total = await q.count()
      q = q.limit(limit).offset((page - 1) * limit)

      const raw = await q.all()

      const items: ProductListItem[] = raw.map((d: any) => ({
        title: d.title,
        description: d.description,
        image: d.image,
        alt: d.alt,
        path: d.path,
        order: d.order,
        slug: d.slug,
      }))

      return { items, total }
    },
    { server: true, default: () => ({ items: [], total: 0 }), watch: [slug], dedupe: 'defer' }
  )
}

