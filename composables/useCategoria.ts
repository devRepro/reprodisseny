

export async function useCategoria(slug: string) {
  const { data: categoria } = await useAsyncData(`categoria-${slug}`, () => {
    return queryCollection('categorias')
      .where('slug', '=', slug)
      .where('type', '=', 'categoria')
      .all()
  })

  return { categoria }
}
