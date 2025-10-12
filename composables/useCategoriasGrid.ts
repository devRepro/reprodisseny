// composables/useCategoriasGrid.ts
export function useCategoriasGrid() {
  return useFetch('/api/categorias', {
    key: 'categorias-grid',
    server: true,                 // SSR → SEO + rendimiento
    default: () => [],
    transform: (rows: any[]) => ({ items: rows }),
  })
}
