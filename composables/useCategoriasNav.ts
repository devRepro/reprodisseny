//Lógica para la navagación y construir el componente MenuBar.vue
     
export const useCategoriasNav = async () => {
  const { data: docs } = await useAsyncData("categorias-navigation", () =>
    queryCollectionNavigation("categorias", ["title", "nav", "slug"])
  )

  return { data: docs }
}
