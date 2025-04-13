export const useContentSearch = () => {
  const searchTerm = ref('')
  const results = ref([])

  const search = async (term: string) => {
    searchTerm.value = term

    if (!term) {
      results.value = []
      return
    }

    const categorias = await queryCollection('categorias')
      .where({
        $or: [
          { title: { $contains: term } },
          { description: { $contains: term } },
          { keywords: { $contains: term } }
        ]
      })
      .select('title', 'path', 'description', 'image', 'slug')
      .find()

    results.value = categorias
  }

  return {
    searchTerm,
    results,
    search,
  }
}
