// composables/useHomeCategoriesGrid.ts
export function useHomeCategoriesGrid(limit = 8) {
  return useFetch("/api/home/categorias", {
    query: { limit },
    key: `home-categorias-${limit}`,
  })
}