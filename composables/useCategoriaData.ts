export function useCategoriaData() {
  const route = useRoute()
  return useAsyncData(route.path, () =>
    queryCollection('categorias').path(route.path).first()
  )
}
