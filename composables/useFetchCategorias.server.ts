// composables/useFetchCategorias.server.ts
import type { Categoria, Subcategoria, Producto } from '@/types'

export async function useFetchCategorias(): Promise<Categoria[]> {
  // 1. Obtén todos los documentos de la colección "categorias"
  const allEntries = await queryCollection('categorias').all()

  // 2. Separa por tipo
  const categorias   = allEntries.filter((e): e is Categoria    => e.type === 'categoria')
  const subcategorias= allEntries.filter((e): e is Subcategoria => e.type === 'subcategoria')
  const productos    = allEntries.filter((e): e is Producto     => e.type === 'producto')

  // 3. Construye el menú enriquecido
  const enrichedMenu: Categoria[] = categorias.map(cat => {
    // Subcategorías con sus productos
    const subs = subcategorias
      .filter(sub => sub.category === cat.slug)
      .map(sub => ({
        ...sub,
        path: `/categorias/${sub.slug}`,
        children: productos
          .filter(prod => prod.category === sub.slug)
          .map(prod => ({
            ...prod,
            path: `/categorias/${sub.slug}/${prod.slug}`
          }))
      }))

    // Productos directos de la categoría
    const directProducts = productos
      .filter(prod => prod.category === cat.slug)
      .map(prod => ({
        ...prod,
        path: `/categorias/${cat.slug}/${prod.slug}`
      }))

    // Devuelve la categoría con ruta y sus hijos
    return {
      ...cat,
      path: `/categorias/${cat.slug}`,
      children: [...subs, ...directProducts]
    }
  })

  return enrichedMenu
}
