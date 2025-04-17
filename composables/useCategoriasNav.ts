export const useCategoriasNav = () => {
  return useAsyncData('categorias-menu', async () => {
    const allCategorias = await queryCollection('categorias')
      .where('type', '=', 'categoria')
      .all()

    const allSubcategorias = await queryCollection('categorias')
      .where('type', '=', 'subcategoria')
      .all()

    const allProductos = await queryCollection('categorias')
      .where('type', '=', 'producto')
      .all()

    // 🧠 Mapear subcategorías con sus productos
    const subcategoriasConProductos = allSubcategorias.map(sub => {
      const subProductos = allProductos.filter(p => p.category === sub.slug)
      return {
        ...sub,
        children: subProductos
      }
    })

    // 🧠 Mapear categorías raíz con subcategorías y productos directos
    const menuItems = allCategorias
      .filter(cat => !cat.category) // solo raíz
      .map(cat => {
        const subcategorias = subcategoriasConProductos.filter(sub => sub.category === cat.slug)
        const productosDirectos = allProductos.filter(p => p.category === cat.slug)

        return {
          ...cat,
          children: [...subcategorias, ...productosDirectos]
        }
      })

    return { menuItems }
  })
}

