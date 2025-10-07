// composables/useCategoriasGrid.ts
import { useAsyncData } from '#app'

export function useCategoriasGrid() {
  return useAsyncData('categorias:basic', async () => {
    // @ts-expect-error auto-import
    const docs = await queryCollection('categorias')
      // .select(['id','_id','slug','title','nav','image','path']) // ❌ quita esto
      .all()

    const normalize = (arr: any[]): any[] =>
      (arr || []).map(d => {
        const id = d.id ?? d._id ?? d.slug
        const slug = d.slug
        const path = d.path && !d.path.startsWith('/api/')
          ? d.path
          : (slug ? `/categorias/${slug}` : null)

        // Resuelve imagen (Opción A: /public/img/categorias/<slug>/<archivo>)
        const img = d.image || ''
        const image =
          /^https?:\/\//.test(img) || img.startsWith('/')
            ? img
            : (slug && img ? `/img/categorias/${slug}/${img}` : '')

        return { id, slug, title: d.title, nav: d.nav, image, path }
      })

    return { items: normalize(docs) }
  }, {
    server: true,
    default: () => ({ items: [] })
  })
}

