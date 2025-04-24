<script setup lang="ts">
// --- Imports ---
// Usa los auto-imports estándar de Nuxt
import { useRoute } from 'vue-router'; // Para obtener la ruta actual
import { useAsyncData, queryContent, useHead, createError } from '#imports'; 
import { computed } from 'vue'; // Para datos derivados

// --- Lógica del Componente ---
const route = useRoute();
const path = route.path; // Obtiene la ruta actual (ej: /categorias/adhesivos/etiqueta-bobina)

console.log(`[DOC EXAMPLE] Intentando buscar contenido para path: ${path}`);

// --- Obtener Contenido del Producto (Siguiendo Ejemplo Documentación) ---
// Usamos useAsyncData para envolver la consulta asíncrona
// Pasamos una función que llama a queryContent().where({...}).findOne()
const { data: page, error, pending } = await useAsyncData(
    `content-${path}`, // Clave única basada en la ruta
    () => {
        console.log(`[DOC EXAMPLE] Ejecutando queryContent().where({ _path: '${path}' }).findOne()`);
        // Retorna directamente la promesa de la consulta
        return queryContent().where({ _path: path }).findOne();
    }
    // No son necesarias opciones extra como 'watch' si la key depende del path
);

// Log después de la carga
console.log('[DOC EXAMPLE] Carga completada. Pending:', pending.value, 'Error:', error.value, 'Data (page):', page.value);

// --- Manejo de Errores ---
// Si hubo un error en useAsyncData o la página no se encontró (findOne devuelve null)
if (process.server && (error.value || !page.value)) {
    console.error(`[DOC EXAMPLE - SSR ERROR] Error cargando ${path}:`, error.value || 'No se encontró el contenido.');
    throw createError({ 
        statusCode: error.value ? 500 : 404, 
        statusMessage: error.value ? 'Error al buscar producto' : 'Producto no encontrado', 
        fatal: true 
    });
} // Considera manejo de error cliente si es necesario

// --- Datos Derivados (SOLO SI page.value existe) ---
// Es importante verificar page.value antes de acceder a sus props
const productSchema = computed(() => page.value?.schema); 
const metaTitle = computed(() => page.value?.metaTitle || page.value?.title || 'Producto');
const metaDescription = computed(() => page.value?.metaDescription || page.value?.description || '');
const seoImageUrl = computed(() => { /* ...tu lógica para URL de imagen... */ 
    if (page.value?.schema?.image) return page.value.schema.image;
    if (page.value?.image) return `https://reprodisseny.com${page.value.image}`; 
    return undefined;
});

// --- Configuración del Head (SOLO SI page.value existe) ---
// El uso de useHead debe estar condicionado o usar valores por defecto seguros
if (page.value) {
    useHead(() => ({ 
        title: metaTitle.value,
        meta: [
          // ... tus metatags (description, keywords, OG, Twitter) ...
            { name: 'description', content: metaDescription.value },
            { name: 'keywords', content: page.value?.keywords?.join(', ') || '' },
            // Open Graph
            { property: 'og:title', content: metaTitle.value },
            { property: 'og:description', content: metaDescription.value },
            ...(seoImageUrl.value ? [{ property: 'og:image', content: seoImageUrl.value }] : []),
            { property: 'og:type', content: 'product' },
            { property: 'og:url', content: `https://reprodisseny.com${route.path}` },
            // Twitter Card
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: metaTitle.value },
            { name: 'twitter:description', content: metaDescription.value },
            ...(seoImageUrl.value ? [{ name: 'twitter:image', content: seoImageUrl.value }] : []),
        ],
        link: [
            { rel: 'canonical', href: `https://reprodisseny.com${route.path}` }
        ],
        script: [
          // Schema JSON-LD
          ...(productSchema.value ? [{
              key: 'product-schema',
              type: 'application/ld+json',
              innerHTML: JSON.stringify(productSchema.value) 
            }] : []) 
        ].filter(Boolean) 
    }));
} else {
    // Fallback si la página no cargó (error manejado antes)
    useHead({
        title: 'Producto no encontrado'
    });
}

console.log('[DOC EXAMPLE] Setup finalizado.');

</script>

<template>
  <div>
    <!-- Estado de Carga -->
    <div v-if="pending">
      <p>Cargando...</p>
    </div>

    <!-- Contenido del Producto (si se cargó correctamente) -->
    <!-- El error fatal en SSR previene llegar aquí si falla -->
    <article v-else-if="page" class="product-detail">
       <h1>{{ page.title }}</h1>
       
       <!-- Imagen Principal (simplificado) -->
       <img v-if="page.image" :src="page.image" :alt="page.alt || page.title">
       
       <!-- Renderizador de Contenido -->
       <ContentRenderer :value="page" />

       <!-- Puedes añadir el resto de secciones (meta, galería, faqs) aquí -->
       <!-- ... -->

    </article>

    <!-- Mensaje si no está pendiente, no hay error, pero tampoco página -->
    <!-- (No debería ocurrir si el manejo de errores es correcto) -->
    <div v-else-if="!pending && !error && !page">
        <p>El contenido para esta ruta no está disponible.</p>
    </div>
    
    <!-- En caso de error en cliente que no sea fatal, podrías mostrar: -->
    <!-- <div v-else-if="error"> -->
    <!--   <p>Error al cargar el contenido.</p> -->
    <!-- </div> -->

  </div>
</template>

<style scoped>
/* Tus estilos */
.product-detail { max-width: 800px; margin: 2rem auto; padding: 1rem; }
img { max-width: 100%; height: auto; margin-bottom: 1rem; }
</style>