import { ref, computed } from 'vue'

export const useSearchResults = () => {
  const searchTerm = ref('') // Término de búsqueda
  const results = ref<any[]>([]) // Resultados de búsqueda

  // Realiza la búsqueda y filtra los resultados
  const search = async (term: string) => {
    if (!term) {
      results.value = [] // Si no hay término de búsqueda, limpia los resultados
      return
    }

    try {
      // Obtén las secciones de 'categorias' usando queryCollectionSearchSections
      const sections = await queryCollectionSearchSections('categorias', {
        ignoredTags: ['code'],
      })

      console.log('Secciones:', sections)

      // Filtra los resultados por título
      const filtered = sections.filter((section) =>
        section.title?.toLowerCase().includes(term.toLowerCase())
      )

      // Asigna los resultados filtrados a 'results'
      results.value = filtered
    } catch (error) {
      console.error('Error al buscar con queryCollectionSearchSections:', error)
      results.value = [] // Si hay un error, limpia los resultados
    }
  }

  // Computada para filtrar categorías
  const filteredCategories = computed(() => {
    return results.value.filter((r: any) => r.type === 'categoria')
  })

  // Computada para filtrar productos
  const filteredProducts = computed(() => {
    return results.value.filter((r: any) => r.type === 'producto')
  })

  return {
    searchTerm,
    results,
    search,
    filteredCategories,
    filteredProducts
  }
}
