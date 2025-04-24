// composables/useProductoBySlug.ts

export const useProductoBySlug = (slug: string) => {
    return useAsyncData(`producto-${slug}`, () =>
      queryCollection('categorias')
        .where('type', '=', 'producto')
        .where('slug', '=', slug)
        .first()
    )
  }
  