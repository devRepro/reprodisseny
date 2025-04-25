<template>
  <div>
    <!-- Muestra cabecera si 'page' (categoría/subcategoría) está cargada -->
    <CategoryHeader 
       v-if="page" 
       :title="page.title" 
       :description="page.description"
       :image="page.image ? `/img/categorias/${page.image}` : undefined" 
       :alt="page.alt" 
       :link="page._path" 
     />

    <!-- Indicador de carga mientras se busca la categoría/subcategoría -->
    <UiSpinner v-else-if="pagePending" /> 
    <!-- Mensaje si la categoría/subcategoría no se encontró -->
    <p v-else-if="pageError || !page">No se pudo cargar la información de la categoría.</p>

    <!-- Sección de Productos -->
    <!-- Muestra spinner mientras se cargan los productos -->
    <div v-if="productsPending" class="text-center py-10">
      <UiSpinner /> 
      <p>Cargando productos...</p>
    </div>
    <!-- Muestra la sección si NO está pendiente Y hay productos -->
    <ProductSection 
       v-else-if="productos && productos.length > 0" 
       :items="productos" 
       id="productos" 
     />
    <!-- Mensaje si no hay productos en esta categoría/subcategoría -->
    <p v-else-if="!productsPending && !productsError" class="text-center py-10 text-gray-600">
        No hay productos disponibles en esta sección.
    </p>
     <!-- Mensaje si hubo error cargando productos -->
    <p v-else-if="productsError" class="text-center py-10 text-red-500">
        Error al cargar los productos.
    </p>

    <!-- Renderizador para el contenido de index.md -->
    <ContentRenderer v-if="page" :value="page" class="prose max-w-none my-10 px-4" /> 

    <!-- Resto de componentes -->
    <UiCallAction />
    <UiFaqSection v-if="page?.faqs?.length" :faqs="page.faqs" />
    <!-- <div v-else> <p>No hay preguntas frecuentes disponibles.</p> </div> -->

  </div>
</template>

<script setup lang="ts">
// Layout específico si lo tienes
// definePageMeta({ layout: 'categorias' })

import { useRoute } from 'vue-router';
import { useAsyncData, useHead, createError } from '#imports';
// Importa tus composables y tipos
import { useProductosByCategoria } from '@/composables/useProductosByCategoria'; 
// import { useStructuredData } from '@/composables/useStructuredData'; // Si lo usas para categoría
import type { Producto, Categoria } from '@/types'; // Asume que tienes tipo Categoria con faqs, etc.
import { computed } from 'vue';

const route = useRoute();
// La ruta completa, ej: /categorias/adhesivos o /categorias/gran-formato/material-flexible
const categoryPath = route.path; 

// --- 1. Obtener datos de la Categoría/Subcategoría (index.md) ---
// Busca el archivo index.md DENTRO de la ruta actual
const { 
  data: page, // Información de la categoría/subcategoría desde index.md
  error: pageError, 
  pending: pagePending 
} = await useAsyncData(
  `categoria-${categoryPath}`,
  () => queryContent<Categoria>(`${categoryPath}/index`).findOne() // Busca index.md
);

// Manejo de error si la CATEGORÍA no se encuentra
if (process.server && (pageError.value || !page.value)) {
    throw createError({ 
        statusCode: pageError.value ? 500 : 404, 
        statusMessage: pageError.value ? 'Error al buscar categoría' : 'Categoría no encontrada', 
        fatal: true 
    });
}

// --- 2. Obtener Productos de esta Categoría/Subcategoría ---
// Llama al composable corregido (¡no necesita argumento!)
const { 
  data: productos, 
  error: productsError, 
  pending: productsPending 
} = useProductosByCategoria(); // Llama SIN argumentos

// --- 3. SEO y Datos Estructurados (Basado en 'page') ---
// (Tu lógica de useHead/useSeoMeta para la categoría iría aquí,
//  asegúrate de que se ejecute solo si page.value existe)
if(page.value) {
  const pageTitle = computed(() => page.value?.metaTitle || page.value?.title || 'Categoría');
  const pageDescription = computed(() => page.value?.metaDescription || page.value?.description || '');
  // ... calcula otras variables SEO ...
  const baseUrl = 'https://reprodisseny.com'; 
  const canonicalUrl = computed(() => `${baseUrl}${route.path}`);
  const seoImageUrl = computed(() => page.value?.image ? `${baseUrl}/img/categorias/${page.value.image}`: `${baseUrl}/og-image.jpg`);

  useSeoMeta({
    title: pageTitle.value,
    description: pageDescription.value,
    ogTitle: pageTitle.value,
    ogDescription: pageDescription.value,
    ogUrl: canonicalUrl.value,
    ogImage: seoImageUrl.value,
    ogType: 'website', // O 'CollectionPage' semánticamente
    // ... Twitter cards ...
  });

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl.value }],
    // script: [...] // Tu JSON-LD para CollectionPage aquí si lo tienes
  });
} else {
  useHead({ title: 'Categoría no encontrada' });
}

</script>

<style scoped>
/* Añade estilos si es necesario */
.prose { /* Estilos básicos para contenido markdown */
  line-height: 1.7;
}
/* Adapta estilos del prose si usas Tailwind Typography */
</style>