export function useCategoriasGrid() {
  return useFetch("/api/home/categorias", {
    key: "home-categorias",
    server: true,
    default: () => [],
  })
}