// composables/useCategoriasNav.ts
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

    return categorias.map((categoria: any) => ({
      ...categoria,
      children: categoria.children?.filter((p: any) => p.type === 'producto')
    }))
  })
}

