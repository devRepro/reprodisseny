

export async function useSubcategorias(parentSlug: string) {
  const { data: subcategorias } = await useAsyncData(`subcategorias-${parentSlug}`, () => {
    return queryCollection('categorias')
      .where('parent', '=', parentSlug)
      .where('type', '=', 'categoria') // subcategorías son también de tipo 'categoria'
      .find()
  })

  return { subcategorias }
}
