// composables/useProductosByCategoria.ts

export const useProductosByCategoria = (category: string) => {
  return useAsyncData(`productos-${category}`, () => {
    return queryCollection('categorias')
      .where('type', '=', 'producto')
      .where('category', '=', category)
      .select('title', 'slug', 'path', 'description', 'image', 'alt')
      .all()
  })
}