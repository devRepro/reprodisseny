import { eventHandler, getRouterParam } from 'h3'

export default eventHandler(async (event) => {
  const raw = getRouterParam(event, 'slug') || ''
  const slug = Array.isArray(raw) ? raw.join('/') : String(raw)

  const url = new URL(event.node.req.url || '/', 'http://localhost')
  const limit = Number(url.searchParams.get('limit') ?? 24)
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
  const sort = (url.searchParams.get('sort') ?? 'order')
  const direction = (url.searchParams.get('direction') ?? 'ASC').toUpperCase() === 'DESC' ? -1 : 1
  const q = (url.searchParams.get('q') ?? '').trim()
  const includeSub = url.searchParams.get('includeSubcategory') === 'true'

  // Base: por categoría exacta (ajusta 'categorySlug' a tu schema)
  let base = queryCollection(event, 'productos')
    .where('hidden', '!=', true)
    .sort(sort, direction)
  // Filtrado por categoría
  if (includeSub) {
    // si tus slugs de subcategoría son "padre/hijo", podrías hacer:
    base = base.where('categorySlug', 'LIKE', `${slug}%`)
  } else {
    base = base.where('categorySlug', '=', slug)
  }
  // Búsqueda sencilla (depende de tus campos)
  if (q) base = base.where('title', 'LIKE', `%${q}%`)

  const total = await base.count()
  const items = await base.limit(limit).skip((page - 1) * limit).find()

  return {
    items,
    page,
    pages: Math.ceil(total / limit),
    total,
    limit
  }
})

