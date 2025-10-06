// composables/useCategoriasNav.ts
export function useCategoriasNav() {
  return useAsyncData('categorias-nav', () =>
    queryCollectionNavigation('categorias', ['slug','title','nav','order','image','description','featured','hidden','path'])
      .where('hidden', '=', false)
      .order('order', 'ASC')
  )
}
