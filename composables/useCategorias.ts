export const useCategorias = () => {
  return useAsyncData('categorias', () =>
    queryContent('categorias')
      .where({ type: 'categoria' })
      .only(['title', 'slug', '_path'])
      .sort({ title: 1 })
      .find()
  )
}
