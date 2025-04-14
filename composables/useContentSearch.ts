import { ref, computed } from 'vue'

export const useContentSearch = () => {
  const searchTerm = ref('')
  const results = ref<any[]>([])

  const filteredCategories = computed(() => {
    return results.value.filter((r: any) => r.type === 'categoria')
  })

  const filteredProducts = computed(() => {
    return results.value.filter((r: any) => r.type === 'producto')
  })

  const search = async (term: string) => {
    if (!term) {
      results.value = []
      return
    }

    try {
      // Usamos queryCollectionSearchSections para obtener las secciones de 'categorias'
      const sections = await queryCollectionSearchSections('categorias', {
        ignoredTags: ['code'],
      })

      console.log('Secciones:', sections) // Verifica qué estamos obteniendo de las categorías

      // Filtramos las secciones por el término de búsqueda
      const filtered = sections.filter((section) =>
        section.title?.toLowerCase().includes(term.toLowerCase())
      )

      console.log('Filtrados:', filtered) // Asegúrate de que solo las categorías correctas estén en los resultados

      results.value = filtered
    } catch (error) {
      console.error('Error al buscar con queryCollectionSearchSections:', error)
      results.value = []
    }
  }

  return {
    searchTerm,
    results,
    search,
    filteredCategories,
    filteredProducts
  }
}
