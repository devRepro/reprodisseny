export const useCategoriaBySlug = (slug: string) => {
    return useAsyncData(`categoria-${slug}`, () =>
      queryContent(`/categorias/${slug}`).findOne()
    )
  }
  