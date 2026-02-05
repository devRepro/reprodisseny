# Mejoras SEO y Favicons en Nuxt 3

Este documento resume las mejores prácticas para implementar metadatos SEO dinámicos por página y mejorar la compatibilidad de favicons en un proyecto Nuxt 3, basándose en discusiones previas.

## 1. SEO Dinámico por Página con `useSeoMeta`

Los metadatos definidos globalmente en `nuxt.config.ts` son solo valores por defecto. Para un buen SEO, cada página (producto, categoría, artículo de blog, etc.) debe tener metadatos específicos y relevantes. El composable `useSeoMeta` es la herramienta recomendada para esto.

### ¿Por qué `useSeoMeta`?

*   Simplifica la definición de los tags `<meta>` más comunes (title, description, Open Graph, Twitter Cards).
*   Es más conciso y semántico que usar `useHead` para cada meta tag individualmente.
*   Funciona perfectamente con el renderizado del lado del servidor (SSR) de Nuxt.

### Elementos Complementarios con `useHead`

Aunque `useSeoMeta` cubre la mayoría de los tags `<meta>`, seguirás necesitando `useHead` para otros elementos del `<head>`, como:

*   **Links Canónicos (`<link rel="canonical">`):** Esencial para indicar a los motores de búsqueda la URL preferida de la página.
*   **Datos Estructurados (`<script type="application/ld+json">`):** Para Schema.org (Product, CollectionPage, Article, FAQPage, etc.).
*   Otros links (preconnect, prefetch, etc.) o scripts específicos.

### Ejemplo de Implementación (Página de Producto)

Este ejemplo asume una página como `pages/productos/[slug].vue` o `pages/categorias/[category]/[product].vue` que obtiene datos del producto usando `useAsyncData` y `queryContent`.

```vue
<script setup lang="ts">
// --- Imports ---
import { computed, useRoute } from 'vue'; 
import { 
    useAsyncData, 
    useSeoMeta, // ¡Importante!
    useHead,    // Para canonical y JSON-LD
    createError, 
    queryCollection
} from '#imports'; 

// --- Obtención de Datos (Asumiendo que funciona) ---
const route = useRoute();
const path = route.path; 
const { data: page, error } = await useAsyncData(
    `content-${path}`, 
    () => queryCollection().where({ _path: path }).findOne()
);

// --- Manejo de Errores (Como se discutió) ---
if (process.server && (error.value || !page.value)) {
    throw createError({ 
        statusCode: error.value ? 500 : 404, 
        statusMessage: error.value ? 'Error al buscar producto' : 'Producto no encontrado', 
        fatal: true 
    });
}

// --- Lógica SEO y Head (SOLO SI page.value existe) ---
if (page.value) {
    
    // --- Calcula valores dinámicos necesarios ---
    const pageTitle = computed(() => page.value?.metaTitle || page.value?.title || 'Producto');
    const pageDescription = computed(() => page.value?.metaDescription || page.value?.description || '');
    const baseUrl = 'https://reprodisseny.com'; // Cambia a tu URL real
    const canonicalUrl = computed(() => `${baseUrl}${route.path}`);
    const seoImageUrl = computed(() => {
        if (page.value?.schema?.image) return page.value.schema.image; 
        if (page.value?.image) return `${baseUrl}${page.value.image}`; 
        return `${baseUrl}/og-image.jpg`; // Fallback
    });

    // --- Usa useSeoMeta para los tags principales ---
    useSeoMeta({
      title: pageTitle.value,          // <title>
      description: pageDescription.value, // <meta name="description">
      
      // Open Graph (og:*)
      ogTitle: pageTitle.value,
      ogDescription: pageDescription.value,
      ogUrl: canonicalUrl.value,
      ogImage: seoImageUrl.value,
      ogType: 'product', // Ajusta según tipo de página ('article', 'website')

      // Twitter Card (twitter:*)
      twitterCard: 'summary_large_image',
      twitterTitle: pageTitle.value,
      twitterDescription: pageDescription.value,
      twitterImage: seoImageUrl.value,
    });

    // --- Usa useHead para elementos complementarios ---
    useHead({
      link: [
        // Enlace Canónico Dinámico
        { 
          rel: 'canonical', 
          href: canonicalUrl.value 
        }
      ],
      script: [
        // Datos Estructurados JSON-LD (Asumiendo 'schema' en frontmatter)
        ...(page.value.schema ? [{
            key: 'product-schema', // O el tipo de schema apropiado
            type: 'application/ld+json',
            innerHTML: JSON.stringify(page.value.schema) 
          }] : []) 
      ],
    });

} else {
    // Fallback si la página no cargó
    useHead({ title: 'Contenido no encontrado' });
}
</script>

<template>
  <div>
    <!-- Template de tu página -->
  </div>
</template>