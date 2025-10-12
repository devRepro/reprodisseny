import { defineEventHandler, getRouterParams, getQuery } from 'h3'


function sanitizeProduct(p: any) {
  return {
    _id:  p.id,
    path: p.path,
    title: p.title,
    description: p.description ?? '',
    image: p.image || '/img/placeholder.webp',
    slug:  p.slug || (p.path?.split('/').pop() || ''),
  }
}

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event) as { slug: string }
  const q = getQuery(event)

  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(100, Number(q.limit) || 24)
  const sortField = (q.sort === 'title' ? 'title' : 'order') as 'title' | 'order'
  const sortDirection = (q.direction === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC'

  const all = await queryCollection(event, 'productos')
    .where('categorySlug', '=', slug)
    .where('hidden', '=', false)
    .order(sortField, sortDirection)
    .select('id','path','title','description','image','slug','order','hidden','categorySlug')
    .all()

  const total = all.length
  const start = (page - 1) * limit
  const items = all.slice(start, start + limit).map(sanitizeProduct)

  return { items, page, pages: Math.ceil(total / limit), total, limit }
})



