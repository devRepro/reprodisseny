// composables/useProductosByCategoria.ts


export const useProductosByCategoria = async (categoriaSlug: string) => {
  console.log('🔍 Buscando productos para:', categoriaSlug)
  const productos = await queryCollection("categorias")
    .where({ type: 'producto', categoria: categoriaSlug })
    .only(['title', '_path', 'image'])
    .find()
    console.log('✅ Productos encontrados:', productos)
  return productos as CategoriasCollectionItem[]
}