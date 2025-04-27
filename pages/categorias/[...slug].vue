<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAsyncData, useHead, showError, computed, defineAsyncComponent } from '#imports';
// Asegúrate de que queryCollection esté disponible/importado
// import { queryCollection } from 'path/to/your/queryCollection';

// --- Importar Tipos Centralizados ---
// Usamos 'import type' ya que son solo para verificación de tipos
import type { Categoria, Producto, FaqItem, SchemaOrg } from '@/types'; // Importa los tipos necesarios

// --- Componentes Asíncronos (Opcional, para código splitting si las vistas son grandes) ---
// Si las vistas de categoría y producto son muy complejas, considera cargarlas lazy
// const CategoryView = defineAsyncComponent(() => import('@/components/category/CategoryView.vue'));
// const ProductView = defineAsyncComponent(() => import('@/components/product/ProductView.vue'));
// Por ahora, mantenemos todo en un archivo para simplicidad, pero tenlo en cuenta.

// --- Lógica Principal ---
const route = useRoute();
const router = useRouter();

// 1. Extraer el slug objetivo y construir el fullPath
const slugParts = route.params.slug as string[];
if (!Array.isArray(slugParts) || slugParts.length === 0) {
  // Esto no debería pasar con [...slug], pero es una buena guardia
  throw showError({ statusCode: 404, statusMessage: 'Página no encontrada (Ruta inválida)' });
}
const targetSlug = slugParts[slugParts.length - 1];
const fullPath = `/categorias/${slugParts.join('/')}`; // Ruta canónica esperada

// 2. Fetch Contenido Principal (Categoria o Producto) por SLUG
//    El tipo esperado es Categoria o Producto según tus tipos
const { data: contentData, pending, error } = await useAsyncData<Categoria | Producto>(
  `collection-content-${fullPath}`, // Clave de caché única por URL
  async () => {
    try {
      // *** ¡ACCIÓN REQUERIDA! ***
      // Reemplaza '.first()' con el método correcto de TU queryCollection
      // para buscar por 'slug' y obtener UN único resultado.
      const item = await queryCollection('categorias') // O tu colección
        .where('slug', '=', targetSlug)
        .first(); // <-- VERIFICA/CAMBIA ESTE MÉTODO

      if (!item) {
        console.warn(`Elemento no encontrado en colección para slug: ${targetSlug}. Ruta: ${fullPath}`);
        // Lanza 404 si el slug no encuentra match
        throw showError({ statusCode: 404, statusMessage: 'Contenido no encontrado' });
      }

      // Asegurar que el 'path' existe en el objeto devuelto o añadirlo
      if (!item.path) {
          item.path = fullPath;
      }

      // Asertar el tipo para usarlo en el componente si queryCollection no devuelve tipos
      // Si queryCollection devuelve tipos correctos, esto puede ser innecesario
      if (item.type === 'producto') return item as Producto;
      if (item.type === 'categoria') return item as Categoria;

      // Fallback si el tipo no es reconocido
      console.warn(`Tipo de contenido no reconocido para slug ${targetSlug}: ${item.type}`);
      // Puedes lanzar un error 500 o intentar devolverlo y manejarlo en el template
       return item as any; // Devolver como tipo genérico para manejar en template
      // throw showError({ statusCode: 500, statusMessage: `Tipo de contenido no soportado: ${item.type}` });

    } catch (err) {
        // Si es un error 404 lanzado arriba, showError ya lo maneja.
        // Si es otro error (red, BD, etc.), loguear y lanzar un error genérico 500
        if ((err as any).statusCode === 404) throw err; // Re-lanzar 404 para showError
        console.error(`Error fetching content for slug ${targetSlug}:`, err);
        throw showError({ statusCode: 500, statusMessage: 'Error al cargar el contenido' });
    }
  }
);

// 3. Determinar el tipo de contenido para renderizado y lógica condicional
const contentType = computed(() => contentData.value?.type);

// 4. (Condicional) Cargar productos asociados SI el contenido principal es una Categoria
const categorySlugForProducts = computed(() =>
  contentType.value === 'categoria' ? (contentData.value as Categoria)?.slug : null
);

// Fetch Productos Asociados - Usa tipo Producto importado
const { data: associatedProducts, pending: pendingProducts } = await useAsyncData<Producto[]>(
  `associated-products-${fullPath}`, // Clave de caché única
  async () => {
    if (categorySlugForProducts.value) {
      try {
         // *** ¡ACCIÓN REQUERIDA! ***
        // Reemplaza '.find()' con el método correcto de TU queryCollection
        // para obtener MÚLTIPLES resultados filtrados.
        const products = await queryCollection('categorias') // O tu colección
          .where('type', '=', 'producto')
          .where('category', '=', categorySlugForProducts.value)
          .find(); // <-- VERIFICA/CAMBIA ESTE MÉTODO

        // Asegurar que el resultado es un array
        return Array.isArray(products) ? products as Producto[] : [];

      } catch (err) {
          console.error(`Error fetching associated products for category ${categorySlugForProducts.value}:`, err);
          // Devolver array vacío en caso de error en la carga de productos (no bloqueante)
          return [];
      }
    }
    // Si no es categoría o slug no válido, devolver array vacío
    return Promise.resolve([]);
  },
  {
    // El watcher asegura que si por alguna razón categorySlugForProducts cambia,
    // esta consulta se re-ejecute. default: () => [] asegura array vacío inicial.
    watch: [categorySlugForProducts],
    default: () => []
  }
);

// 5. Configurar Metadatos (SEO) - Estandarizado o Adaptado
useHead(() => {
  // Mientras carga, mostrar un título básico
  if (pending.value || !contentData.value) {
    return { title: 'Cargando...' };
  }

  const item = contentData.value;

  // Lógica de metadatos usando campos Estandarizados (si aplica)
  // Si sus datos USAN seoTitle/seoDescription/schema consistentemente:
  /*
  const seoTitle = item.seoTitle || item.title;
  const seoDescription = item.seoDescription || item.description || '';
  const keywordsArray = Array.isArray(item.keywords) ? item.keywords : (item.keywords ? item.keywords.split(/, ?| ?; ?/) : []);
  const schemaData = item.schema; // Acceso directo si el campo se llama 'schema' para todos
  */

  // Lógica de metadatos ADAPTADA a la estructura de types/index.ts
  // (usando metatitle/metadescription en Producto, title/description en Categoria, schema vs structuredData)
  let pageTitle = item.title;
  let pageDescription = item.description || '';
  let schemaData = null;

  if (item.type === 'producto') {
    const productItem = item as Producto; // Aserción para acceder a campos específicos
    if (productItem.metatitle) pageTitle = productItem.metatitle;
    if (productItem.metadescription) pageDescription = productItem.metadescription;
    schemaData = productItem.schema;
  } else if (item.type === 'categoria') {
    const categoryItem = item as Categoria; // Aserción
     // Usar metaTitle/metaDescription del ejemplo si los añadió a su tipo Categoria
     if (categoryItem.metaTitle) pageTitle = categoryItem.metaTitle;
     if (categoryItem.metaDescription) pageDescription = categoryItem.metaDescription;
    schemaData = categoryItem.schema; // O categoryItem.structuredData si prefiere ese nombre
  }

  const keywordsArray = Array.isArray(item.keywords) ? item.keywords : (item.keywords ? item.keywords.split(/, ?| ?; ?/) : []);


  return {
    title: pageTitle,
    meta: [
      { name: 'description', content: pageDescription },
      { name: 'keywords', content: keywordsArray.join(', ') },
       // Open Graph y Twitter Card (Opcional - MUY RECOMENDADO para compartir en redes)
       { property: 'og:title', content: pageTitle },
       { property: 'og:description', content: pageDescription },
       { property: 'og:type', content: item.type === 'producto' ? 'product' : 'website' }, // O 'product' para productos, 'website' o 'article' para categorías
       { property: 'og:url', content: `https://tusitio.com${fullPath}` }, // **REEMPLAZA 'tusitio.com'**
       { property: 'og:image', content: item.image ? `https://tusitio.com${resolveImageUrl(item.image, item.type)}` : `https://tusitio.com/default-og-image.jpg` }, // **REEMPLAZA 'tusitio.com' y placeholder**
       { name: 'twitter:card', content: 'summary_large_image' }, // or 'summary'
       { name: 'twitter:title', content: pageTitle },
       { name: 'twitter:description', content: pageDescription },
       { name: 'twitter:image', content: item.image ? `https://tusitio.com${resolveImageUrl(item.image, item.type)}` : `https://tusitio.com/default-twitter-image.jpg` }, // **REEMPLAZA 'tusitio.com' y placeholder**
    ].filter(Boolean), // Eliminar meta tags si el contenido es null
     // Link canónico (MUY RECOMENDADO para SEO)
    link: [{ rel: 'canonical', href: `https://tusitio.com${fullPath}` }], // **REEMPLAZA 'tusitio.com'**
    // JSON-LD Schema.org
    script: schemaData ? [{ type: 'application/ld+json', children: JSON.stringify(schemaData) }] : [],
  };
});

// --- Funciones Auxiliares (Ajustadas ligeramente) ---

// Usa tipo Producto importado
function goToProduct(product: Producto) {
  // Construye la ruta basada en la convención: /categorias/slug-categoria/slug-producto
  // Esto asume que product.category contiene el slug del padre inmediato
  const path = `/categorias/${product.category}/${product.slug}`;
  router.push(path);
}

// Resuelve la URL de la imagen basándose en el path de la BD y el tipo de item
function resolveImageUrl(imagePath: string | undefined, type: 'categoria' | 'producto' | string | undefined): string {
    if (!imagePath) return '/img/placeholder.webp'; // Placeholder por defecto
    if (imagePath.startsWith('/') || imagePath.startsWith('http')) return imagePath; // Ya es una URL completa o absoluta desde /public

    // Basado en la convención asumida: añadir /img/categorias/ si no empieza con / y es categoria
    const basePath = type === 'categoria' ? '/img/categorias/' : ''; // Los productos ya vienen con ruta completa según ejemplos
    return basePath + imagePath;
}


// --- Lógica para el template (Renderizado Condicional) ---
// No hay un computed específico para showBreadcrumbs aquí, se maneja en el componente AppCrumbs
// No hay necesidad de un computed para showContent, el v-else-if="contentData" ya lo hace

</script>

<template>
  <div class="category-product-page">
    <!-- Indicador de Carga Principal -->
    <div v-if="pending" class="text-center py-10">
      <p>Cargando {{ slugParts.join('/') }}...</p>
      <!-- Puedes añadir un spinner aquí -->
    </div>

    <!-- Contenido Cargado -->
    <div v-else-if="contentData">
      <!-- Aquí iría el componente Breadcrumbs -->
      <!-- <AppCrumbs /> -->

      <!-- *** VISTA DE CATEGORÍA *** -->
      <div v-if="contentType === 'categoria'">
        <header class="mb-8">
          <h1 class="text-3xl font-bold mb-2">{{ (contentData as Categoria).title }}</h1>
          <p v-if="(contentData as Categoria).description" class="text-lg text-gray-600 mb-4">{{ (contentData as Categoria).description }}</p>
           <NuxtImg
            v-if="(contentData as Categoria).image"
            :src="resolveImageUrl((contentData as Categoria).image, contentData.type)"
            :alt="(contentData as Categoria).alt || (contentData as Categoria).title"
            class="w-full h-auto max-h-96 object-cover rounded-md mb-6 bg-gray-100"
            loading="lazy"
            format="webp" quality="80" densidades="x1 x2"
           />
           <div v-else class="w-full h-64 bg-gray-200 rounded-md mb-6 flex items-center justify-center text-gray-400">Imagen no disponible</div>
        </header>

        <!-- Sección de Productos Asociados -->
        <section v-if="categorySlugForProducts">
          <h2 class="text-2xl font-semibold mb-6 border-b pb-2">Productos en {{ (contentData as Categoria).nav || (contentData as Categoria).title }}</h2>
          <div v-if="pendingProducts" class="text-center py-6">Cargando productos asociados...</div>
          <div v-else-if="associatedProducts && associatedProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <!-- Card de Producto -->
            <div
              v-for="product in associatedProducts"
              :key="product.id || product.slug"
              class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col cursor-pointer"
              role="link"
              tabindex="0"
              @click="goToProduct(product)"
              @keydown.enter="goToProduct(product)"
            >
              <NuxtImg
                v-if="product.image"
                :src="resolveImageUrl(product.image, product.type)"
                :alt="product.alt || product.title"
                class="w-full h-48 object-cover"
                loading="lazy"
                format="webp" quality="80" densidades="x1 x2"
              />
              <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">Sin imagen</div>
              <div class="p-4 flex flex-col flex-grow">
                <h3 class="font-semibold text-lg mb-1">{{ product.nav || product.title }}</h3>
                <p v-if="product.description" class="text-sm text-gray-500 mb-2 line-clamp-3 flex-grow">{{ product.description }}</p>
                <div class="mt-auto pt-2 font-bold text-primary text-right">{{ formatPrice(product.price) || 'Ver producto' }}</div>
              </div>
            </div>
          </div>
           <p v-else class="text-gray-500 italic">Actualmente no hay productos específicos listados en esta categoría.</p>
        </section>

         <!-- Sección de FAQs de Categoría -->
         <section v-if="(contentData as Categoria).faqs && (contentData as Categoria).faqs!.length > 0" class="mt-12">
             <h2 class="text-2xl font-semibold mb-6 border-b pb-2">Preguntas Frecuentes</h2>
             <div class="space-y-4">
                 <details v-for="(faq, index) in (contentData as Categoria).faqs" :key="index" class="bg-gray-50 p-4 rounded group">
                     <summary class="font-medium cursor-pointer list-none flex justify-between items-center"><span>{{ faq.question }}</span><span class="text-gray-400 group-open:rotate-90 transition-transform duration-200 text-xl font-light ml-2">+</span></summary>
                     <p class="mt-3 text-gray-700 leading-relaxed">{{ faq.answer }}</p>
                 </details>
             </div>
         </section>
          <!-- Puedes añadir el contenido del Markdown de la categoría aquí si tu base de datos lo proporciona en un campo -->
          <!-- <div v-if="(contentData as Categoria).body" v-html="(contentData as Categoria).body"></div> -->
      </div>

      <!-- *** VISTA DE PRODUCTO *** -->
      <div v-else-if="contentType === 'producto'">
        <!-- Usamos aserciones para acceder a campos específicos de Producto -->
         <header class="mb-8">
          <h1 class="text-3xl font-bold mb-2">{{ (contentData as Producto).title }}</h1>
           <p v-if="(contentData as Producto).sku" class="text-sm text-gray-500 mb-3">Referencia: {{ (contentData as Producto).sku }}</p>
           <NuxtImg
            v-if="(contentData as Producto).image"
            :src="resolveImageUrl((contentData as Producto).image, contentData.type)"
            :alt="(contentData as Producto).alt || (contentData as Producto).title"
            class="w-full h-auto max-h-[500px] object-contain rounded-md mb-6 bg-gray-100"
            loading="lazy"
            format="webp" quality="80" densidades="x1 x2"
           />
           <div v-else class="w-full h-64 bg-gray-200 rounded-md mb-6 flex items-center justify-center text-gray-400">Imagen no disponible</div>
        </header>
         <div class="mb-6">
             <div v-if="(contentData as Producto).price && formatPrice((contentData as Producto).price)" class="text-2xl font-bold text-primary mb-3">{{ formatPrice((contentData as Producto).price) }}</div>
             <p v-if="(contentData as Producto).description" class="text-lg text-gray-600">{{ (contentData as Producto).description }}</p>
            <p v-if="(contentData as Producto).brand" class="text-sm text-gray-500 mt-2">Marca: {{ (contentData as Producto).brand }}</p>
             <!-- Mostrar 'inStock' si es relevante -->
             <!-- <p v-if="(contentData as Producto).inStock" class="text-sm text-green-600 mt-1">En stock</p> -->
             <!-- <p v-else class="text-sm text-red-600 mt-1">Agotado</p> -->
         </div>

         <!-- Sección de FAQs de Producto -->
         <section v-if="(contentData as Producto).faqs && (contentData as Producto).faqs!.length > 0" class="mt-12">
              <h2 class="text-2xl font-semibold mb-6 border-b pb-2">Preguntas Frecuentes</h2>
              <div class="space-y-4">
                 <details v-for="(faq, index) in (contentData as Producto).faqs" :key="index" class="bg-gray-50 p-4 rounded group">
                     <summary class="font-medium cursor-pointer list-none flex justify-between items-center"><span>{{ faq.question }}</span><span class="text-gray-400 group-open:rotate-90 transition-transform duration-200 text-xl font-light ml-2">+</span></summary>
                     <p class="mt-3 text-gray-700 leading-relaxed">{{ faq.answer }}</p>
                 </details>
             </div>
         </section>
         <!-- Puedes añadir otros campos específicos de producto aquí -->
         <!-- <div v-if="(contentData as Producto).galleryImages && (contentData as Producto).galleryImages.length > 0">...</div> -->
         <!-- <div v-if="(contentData as Producto).formFields && (contentData as Producto).formFields.length > 0">...</div> -->
      </div>

      <!-- Fallback si el tipo de contenido no se reconoce -->
      <div v-else>
        <p class="text-center text-orange-500 py-10">Tipo de contenido ('{{contentData.type}}') no reconocido.</p>
      </div>
    </div>

     <!-- Manejo de Errores (aparte del 404 manejado por showError) -->
     <div v-else-if="error && !pending">
       <p class="text-red-500 text-center py-10">
         Error al cargar la información. Por favor, refresca la página o inténtalo más tarde.
         Detalles del error: {{ error.message }} <!-- Mostrar mensaje de error para depuración -->
       </p>
     </div>
  </div>
</template>

<style scoped>
/* Estilos sin cambios */
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
summary.list-none { list-style: none; }
summary.list-none::-webkit-details-marker { display: none; }
</style>