// composables/useCategoriasHome.ts

export function useCategoriasHome() {
  // Se ejecuta en SSR y en CSR; cachea por key 'categorias-home'
  return useAsyncData('categorias-home', () =>
    queryCollection('categorias')
      .where('type', '=', 'categoria')
      .all()
  )
}
