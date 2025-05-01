export const useCategoriasMenu = async () => {
    const store = useCategoriasStore()
    await store.fetchCategorias()
  
    return {
      categorias: computed(() => store.menu)
    }
  }
  