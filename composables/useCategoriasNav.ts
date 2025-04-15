

export const useCategoriasNav = () => {
  return useAsyncData('categorias-nav', async () => {
    // Obtenemos todas las categorías
    const categorias = await queryContent('categorias')
      .where({ type: 'categoria' })
      .only(['title', 'slug', 'path', 'image', 'alt', 'description'])
      .find()

    // Para cada categoría, obtenemos sus productos hijos
    const result = await Promise.all(
      categorias.map(async (categoria:any) => {
        const productos = await queryContent(`categorias/${categoria.slug}`)
          .where({ type: 'producto' })
          .only(['title', 'slug', 'path'])
          .find()

        return {
          ...categoria,
          children: productos
        }
      })
    )

    return result
  })
}
