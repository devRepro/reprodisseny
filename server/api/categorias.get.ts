// Lista categorías para el carrusel (collections)
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const rows = await queryCollection(event, 'categorias')
    .select('id', 'path', 'title', 'nav', 'description', 'image', 'featured', 'order', 'hidden')
    .where('hidden', '=', false)           // si usas 'hidden' en schema
    .order('order', 'ASC')
    .all()

  return rows.map((i: any) => ({
    id:    i.id,
    slug:  i.path?.split('/').pop() || '',
    path:  i.path,
    title: i.title,
    nav:   i.nav ?? i.title,
    description: i.description ?? '',
    image: i.image || null,
    featured: !!i.featured,
    order: i.order ?? 0
  }))
})



