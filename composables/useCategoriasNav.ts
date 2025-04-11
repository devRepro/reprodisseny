import type { Categoria } from '@/types/index'

export const useCategoriasNav = () => {
  return useAsyncData<Categoria[]>('categorias-navigation', async () => {
    const categoriasRaiz = await queryCollectionNavigation('categorias', [
      'title',
      'nav',
      'slug',
      'formFields',
      'type',
      'path'
    ])

    const categorias = categoriasRaiz?.[0]?.children || []

    return categorias.map((categoria: any) => {
      const subcategorias = categoria.children?.filter((c: any) => c.type === 'subcategoria') || []

      const subcategoriasConProductos = subcategorias.map((sub: any) => ({
        ...sub,
        children: sub.children?.filter((p: any) => p.type === 'producto') || []
      }))

      // Si no hay subcategorías, los productos van directo bajo la categoría
      const productosDirectos = categoria.children?.filter((p: any) => p.type === 'producto') || []

      return {
        ...categoria,
        children: subcategoriasConProductos.length > 0 ? subcategoriasConProductos : productosDirectos
      }
    })
  })
}


