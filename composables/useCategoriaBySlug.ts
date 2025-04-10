

export const useCategoriaBySlug = (slug: string) => {
  return useAsyncData(`categoria-${slug}`, () =>
    queryCollection('categorias')
      .where('slug', '=', slug)
      .first()
  )
}
