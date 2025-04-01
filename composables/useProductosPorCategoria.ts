export const useProductosByCategoria = async (slug: string) => {
  return await queryContent(`categorias/${slug}`)
    .where({ _path: { $not: `/categorias/${slug}/index` } })
    .only(['title', '_path'])
    .find()
}
  