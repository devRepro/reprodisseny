<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAsyncData, useHead, showError, computed, defineAsyncComponent } from '#imports';
// Asegúrate de que queryCollection esté disponible/importado
// import { queryCollection } from 'path/to/your/queryCollection';

// --- Importar Tipos Centralizados ---
import type { Categoria, Producto, Subcategoria, FaqItem, SchemaOrg } from '@/types';

// ... (Lógica Principal - useRoute, useRouter, slugParts, fullPath - sin cambios) ...
const route = useRoute();
const router = useRouter();
const slugParts = route.params.slug as string[];
if (!Array.isArray(slugParts) || slugParts.length === 0) {
  throw showError({ statusCode: 404, statusMessage: 'Página no encontrada (Ruta inválida)' });
}
const targetSlug = slugParts[slugParts.length - 1];
const fullPath = `/categorias/${slugParts.join('/')}`;

// 2. Fetch Contenido Principal (Categoria, Subcategoria o Producto)
const { data: contentData, pending, error } = await useAsyncData<Categoria | Producto | Subcategoria | { type: string }>(
  `collection-content-${fullPath}`, // Clave de caché única por URL
  async () => {
    try {
      // *** ¡ACCIÓN REQUERIDA! ***
      const item: any = await queryCollection('categorias') // Usa any temporalmente para flexibilidad de BD
        .where('slug', '=', targetSlug)
        .first(); // <-- VERIFICA/CAMBIA ESTE MÉTODO

      if (!item) {
        console.warn(`DEBUG: Elemento no encontrado en colección para slug: ${targetSlug}. Ruta: ${fullPath}`);
        throw showError({ statusCode: 404, statusMessage: 'Contenido no encontrado' });
      }

      // Asegurar que el 'path' existe o añadirlo
      if (!item.path) { item.path = fullPath; }

      // --- VERIFICACIÓN Y ASERSION DE TIPO ROBUSTA CON MÁS DEBUG ---
      console.log(`DEBUG: Fetched item for slug ${targetSlug}:`, item); // LOG COMPLETO DEL ITEM
      console.log(`DEBUG: Type property value:`, item.type); // LOG SOLO EL VALOR DEL TIPO
      console.log(`DEBUG: Typeof type property:`, typeof item.type); // LOG EL TIPO DE DATO DE LA PROPIEDAD TYPE
      if (typeof item.type === 'string') {
          console.log(`DEBUG: Type property length:`, item.type.length); // LOG LA LONGITUD DEL STRING
          console.log(`DEBUG: Type property trimmed:`, item.type.trim()); // LOG EL STRING SIN ESPACIOS AL PRINCIPIO/FINAL
          console.log(`DEBUG: Is 'subcategoria'?`, item.type === 'subcategoria'); // LOG COMPARACIÓN EXACTA
          console.log(`DEBUG: Is 'subcategoria' trimmed?`, item.type.trim() === 'subcategoria'); // LOG COMPARACIÓN CON TRIM
      } else {
          console.warn(`DEBUG: Item para slug ${targetSlug} no tiene una propiedad 'type' string o está ausente.`, item);
          // Si un item sin tipo es crítico, podrías lanzar un error aquí
          // throw showError({ statusCode: 500, statusMessage: 'Contenido con formato incorrecto (sin tipo)' });
           // Devolver con un tipo mínimo si no hay 'type' string
          return item as { type: string };
      }


      // Luego verifica si el tipo coincide con uno esperado (usando .trim() como prueba) y aserta
      const trimmedType = item.type.trim(); // Usar el tipo sin espacios

      if (trimmedType === 'producto') {
          console.log(`DEBUG: Fetcher identificó tipo 'producto' (trimmed) para slug ${targetSlug}`);
          return item as Producto;
      }
      if (trimmedType === 'categoria') {
           console.log(`DEBUG: Fetcher identificó tipo 'categoria' (trimmed) para slug ${targetSlug}`);
          return item as Categoria;
      }
      if (trimmedType === 'subcategoria') {
           console.log(`DEBUG: Fetcher identificó tipo 'subcategoria' (trimmed) para slug ${targetSlug}`);
          return item as Subcategoria;
      }

      // Si llegamos aquí, item.type ES un string (posiblemente con espacios), pero su versión sin espacios no es ninguno de los esperados
      console.warn(`DEBUG: Fetcher encontró tipo NO RECONOCIDO (trimmed) para slug ${targetSlug}: '${trimmedType}'`);
      // Devuelve el item con el tipo genérico { type: string } para manejo en template
       return item as { type: string };


    } catch (err) {
        if ((err as any).statusCode === 404) throw err; // Re-lanzar 404
        console.error(`Error fetching content for slug ${targetSlug}:`, err);
        throw showError({ statusCode: 500, statusMessage: 'Error al cargar el contenido' });
    }
  }
);

// ... (Resto del script y template - SIN CAMBIOS) ...

// Computed property para acceder a los datos de Categoria o Subcategoria
const currentCollectionItem = computed(() => {
  const item = contentData.value;
  // La lógica aquí es correcta, se basa en el tipo que *finalmente* quedó en contentData.value
  if (item && (item.type === 'categoria' || item.type === 'subcategoria')) {
    return item as Categoria | Subcategoria;
  }
  return null;
});

// ... (Resto del script y template idénticos a la versión anterior) ...

</script>

<template>
  <!-- El template permanece SIN CAMBIOS -->
  <div class="category-product-page">
    <div v-if="pending" class="text-center py-10">
      <p>Cargando {{ slugParts.join('/') }}...</p>
    </div>
    <div v-else-if="error && !pending">
       <p class="text-red-500 text-center py-10">
         Error al cargar la información. Por favor, refresca la página o inténtalo más tarde.
         Detalles del error: {{ error.message }}
       </p>
    </div>
    <div v-else-if="contentData">
      <div v-if="contentType === 'producto'">
         <header class="mb-8">
          <h1 class="text-3xl font-bold mb-2">{{ contentData.title }}</h1>
           <p v-if="(contentData as Producto).sku" class="text-sm text-gray-500 mb-3">Referencia: {{ (contentData as Producto).sku }}</p>
           <NuxtImg v-if="contentData.image" :src="resolveImageUrl(contentData.image, contentData.type)" :alt="contentData.alt || contentData.title" class="w-full h-auto max-h-[500px] object-contain rounded-md mb-6 bg-gray-100" loading="lazy" format="webp" quality="80" densidades="x1 x2"/>
           <div v-else class="w-full h-64 bg-gray-200 rounded-md mb-6 flex items-center justify-center text-gray-400">Imagen no disponible</div>
        </header>
         <div class="mb-6">
             <div v-if="(contentData as Producto).price && formatPrice((contentData as Producto).price)" class="text-2xl font-bold text-primary mb-3">{{ formatPrice((contentData as Producto).price) }}</div>
             <p v-if="contentData.description" class="text-lg text-gray-600">{{ contentData.description }}</p>
            <p v-if="(contentData as Producto).brand" class="text-sm text-gray-500 mt-2">Marca: {{ (contentData as Producto).brand }}</p>
         </div>
         <section v-if="(contentData as Producto).faqs && (contentData as Producto).faqs!.length > 0" class="mt-12">
              <h2 class="text-2xl font-semibold mb-6 border-b pb-2">Preguntas Frecuentes</h2>
              <div class="space-y-4">
                 <details v-for="(faq, index) in (contentData as Producto).faqs" :key="index" class="bg-gray-50 p-4 rounded group">
                     <summary class="font-medium cursor-pointer list-none flex justify-between items-center"><span>{{ faq.question }}</span><span class="text-gray-400 group-open:rotate-90 transition-transform duration-200 text-xl font-light ml-2">+</span></summary>
                     <p class="mt-3 text-gray-700 leading-relaxed">{{ faq.answer }}</p>
                 </details>
             </div>
         </section>
      </div>
      <div v-else-if="currentCollectionItem">
        <header class="mb-8">
          <h1 class="text-3xl font-bold mb-2">{{ currentCollectionItem.title }}</h1>
          <p v-if="currentCollectionItem.description" class="text-lg text-gray-600 mb-4">{{ currentCollectionItem.description }}</p>
           <NuxtImg v-if="currentCollectionItem.image" :src="resolveImageUrl(currentCollectionItem.image, currentCollectionItem.type)" :alt="currentCollectionItem.alt || currentCollectionItem.title" class="w-full h-auto max-h-96 object-cover rounded-md mb-6 bg-gray-100" loading="lazy" format="webp" quality="80" densidades="x1 x2"/>
           <div v-else class="w-full h-64 bg-gray-200 rounded-md mb-6 flex items-center justify-center text-gray-400">Imagen no disponible</div>
        </header>
        <section v-if="collectionItemSlug">
          <h2 class="text-2xl font-semibold mb-6 border-b pb-2">Productos en {{ currentCollectionItem.nav || currentCollectionItem.title }}</h2>
          <div v-if="pendingProducts" class="text-center py-6">Cargando productos asociados...</div>
          <div v-else-if="associatedProducts && associatedProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div v-for="product in associatedProducts" :key="product.id || product.slug" class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col cursor-pointer" role="link" tabindex="0" @click="goToProduct(product)" @keydown.enter="goToProduct(product)">
              <NuxtImg v-if="product.image" :src="resolveImageUrl(product.image, product.type)" :alt="product.alt || product.title" class="w-full h-48 object-cover" loading="lazy" format="webp" quality="80" densidades="x1 x2"/>
              <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">Sin imagen</div>
              <div class="p-4 flex flex-col flex-grow">
                <h3 class="font-semibold text-lg mb-1">{{ product.nav || product.title }}</h3>
                <p v-if="product.description" class="text-sm text-gray-500 mb-2 line-clamp-3 flex-grow">{{ product.description }}</p>
                <div class="mt-auto pt-2 font-bold text-primary text-right">{{ formatPrice(product.price) || 'Ver producto' }}</div>
              </div>
            </div>
          </div>
           <p v-else class="text-gray-500 italic">Actualmente no hay productos específicos listados en esta colección.</p>
        </section>
         <section v-if="currentCollectionItem.faqs && currentCollectionItem.faqs.length > 0" class="mt-12">
             <h2 class="text-2xl font-semibold mb-6 border-b pb-2">Preguntas Frecuentes</h2>
             <div class="space-y-4">
                 <details v-for="(faq, index) in currentCollectionItem.faqs" :key="index" class="bg-gray-50 p-4 rounded group">
                     <summary class="font-medium cursor-pointer list-none flex justify-between items-center"><span>{{ faq.question }}</span><span class="text-gray-400 group-open:rotate-90 transition-transform duration-200 text-xl font-light ml-2">+</span></summary>
                     <p class="mt-3 text-gray-700 leading-relaxed">{{ faq.answer }}</p>
                 </details>
             </div>
         </section>
      </div>
      <div v-else>
        <!-- Mostrar el tipo exacto que causó el problema -->
        <p class="text-center text-orange-500 py-10">Tipo de contenido ('{{contentData.type}}') no reconocido para esta página.</p>
         <!-- Mostrar info adicional para depuración -->
         <pre class="text-xs text-left bg-gray-100 p-4 rounded overflow-auto">{{ JSON.stringify(contentData, null, 2) }}</pre>
      </div>
    </div>
     <div v-else-if="error && !pending">
       <p class="text-red-500 text-center py-10">
         Error al cargar la información. Por favor, refresca la página o inténtalo más tarde.
         Detalles del error: {{ error.message }}
       </p>
     </div>
  </div>
</template>

<style scoped>
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
summary.list-none { list-style: none; }
summary.list-none::-webkit-details-marker { display: none; }
</style>