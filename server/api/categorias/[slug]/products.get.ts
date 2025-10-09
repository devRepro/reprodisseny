import { defineEventHandler, getQuery, getRouterParams } from 'h3'

function sanitizeProduct(p: any) {
  return {
    _id: p.id,
    path: p.path,
    title: p.title,
    description: p.description,
    image: p.image || '/img/placeholder.jpg',
    slug: p.slug || String(p.path || '').split('/').pop(),
  }
}

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event) as { slug?: string }
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Falta el slug de la categoría' })

  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(100, Number(q.limit) || 24)
  const sortField = (q.sort === 'title' ? 'title' : 'order') as 'title' | 'order'
  const sortDirection = (q.direction === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC'

  // Solo filtramos por categorySlug (pocos items → paginamos en memoria)
  const docs = await queryCollection(event, 'productos')
    .where('categorySlug', '=', slug)
    .order(sortField, sortDirection)
    .all() // ~20 → OK

  const total = docs.length
  const start = (page - 1) * limit
  const paged = docs.slice(start, start + limit)

  return {
    items: paged.map(sanitizeProduct),
    page,
    pages: Math.ceil(total / limit),
    total,
    limit,
  }
})
