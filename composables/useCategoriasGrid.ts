// composables/useCategoriasGrid
import { useAsyncData } from '#app'

// Este composable traerá todas las categorías (archivos Markdown en content/categorias)
export function useCategoriasGrid() {
  return useAsyncData('categorias:basic', async () => {
    
    const docs = await queryCollection('categorias')
      .all()

    const normalize = (arr: any[]): any[] =>
      (arr || []).map(d => ({
        id: d.id ?? d._id ?? d.slug,
        slug: d.slug,
        title: d.title,
        nav: d.nav,
        image: d.image,
        path: d.path && !d.path.startsWith('/api/') ? d.path : (d.slug ? `/categorias/${d.slug}` : null)
      }))

    return { items: normalize(docs) }
  }, {
    server: true,
    default: () => ({ items: [] })
  })
}
