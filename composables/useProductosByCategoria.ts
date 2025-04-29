import {  useAsyncData, useRoute } from '#imports';
import type { Producto } from '@/types'; // Asegúrate que Producto incluya _path?: string

/**
 * Obtiene los archivos de producto (archivos .md que NO se llaman index.md)
 * dentro de la ruta de la categoría/subcategoría actual.
 */
export const useProductosByCategoria = () => {
  const route = useRoute();
  
  // Construye la ruta base para buscar dentro de la categoría/subcategoría actual
  // route.path ya debería ser algo como '/categorias/adhesivos' o '/categorias/gran-formato/material-flexible'
  const searchPath = route.path; 

  // Clave única para el caché basada en la ruta de búsqueda
  const asyncDataKey = `productos-en-${searchPath.replace(/\//g, '-')}`; // Reemplaza / para una key válida

  console.log(`[useProductosByCategoria] Buscando productos en: ${searchPath}`); // Log para depuración

  return useAsyncData(
    asyncDataKey,
    async () => {
      try {
        const products = await queryContent<Producto>(searchPath) // Busca DENTRO de la ruta actual
          .where({ 
              // Excluye el archivo 'index.md' de la propia categoría/subcategoría
              _path: { $ne: `${searchPath}/index` } 
              // Opcional: Podrías añadir un filtro por 'type: producto' si lo tienes en el frontmatter de productos
              // type: 'producto' 
          })
          // Selecciona los campos necesarios, incluyendo _path
          .only(['_path', 'title', 'slug', 'image', 'alt']) 
          .sort({ order: 1, title: 1 }) // Ordena si quieres
          .find();

        console.log(`[useProductosByCategoria] Productos encontrados en ${searchPath}:`, products.length); // Log para depuración
        return products;

      } catch (e) {
          console.error(`[useProductosByCategoria] Error buscando productos en ${searchPath}:`, e);
          return []; // Devuelve array vacío en caso de error
      }
    }
  );
}