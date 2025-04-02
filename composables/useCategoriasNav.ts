//Lógica para la navagación
     
  export const useCategoriasNav = async () => {
    const { data: docs } = await useAsyncData("categorias-navigation", () =>
      queryCollectionNavigation("categorias", ["title", "nav", "slug",])
    )
  
    return { data: docs }
  }