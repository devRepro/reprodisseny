

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

    // 🧠 Función recursiva para construir hijos
    const buildChildren = (parentSlug: string) => {
      // Subcategorías hijas
      const subs = allSubcategorias
        .filter(sub => sub.category === parentSlug)
        .map(sub => ({
          ...sub,
          children: buildChildren(sub.slug) // recursivamente construir
        }))

      // Productos hijos
      const productos = allProductos
        .filter(prod => prod.category === parentSlug)

      return [...subs, ...productos]
    }

    // 🧠 Categorías raíz
    const menuItems = allCategorias
      .filter(cat => !cat.category) // solo raíz
      .map(cat => ({
        ...cat,
        children: buildChildren(cat.slug)
      }))

    return { menuItems }
  })
}
