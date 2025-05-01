// pages/categorias/[...slug].vue (o el nombre que tenga tu archivo de página dinámica)
<script setup lang="ts">
// --- Imports ---
import { computed, watchEffect } from '#imports';
import { setPageLayout } from '#imports'; // Para cambiar el layout dinámicamente
import { useCategoriaData } from '@/composables/useCategoriaData'; // Tu composable de datos
import { useSeoContent } from '~/composables/useSeoContent';       // Tu composable de SEO
import CategoryVistaCategoria from '@/components/category/vista/Categoria.vue';
import CategoryVistaProducto from '@/components/category/vista/Producto.vue';
import CategoryVistaSubcategoria from '@/components/category/vista/Subcategoria.vue';
import SharedLoader from '@/components/shared/Loader.vue'; // Asumiendo que tienes un Loader

// --- Fetch Page-Specific Data ---
const { contentData, pending, error } = useCategoriaData();

// --- Determine Component to Render ---
const contentType = computed(() => contentData.value?.type || null);

const componentMap = {
  categoria: CategoryVistaCategoria,
  producto: CategoryVistaProducto,
  subcategoria: CategoryVistaSubcategoria,
} as const;

const resolvedComponent = computed(() => {
  const type = contentType.value;
  return type ? componentMap[type as keyof typeof componentMap] : null;
});

// --- Dynamically Set Page Layout ---
watchEffect(() => {
  // Determine the layout based on the fetched content type or state
  const type = contentData.value?.type;

  if (type === 'producto') {
    setPageLayout('productos');
    // console.log("Debug: Layout set to 'productos'");
  } else if (type === 'categoria' || type === 'subcategoria') {
    setPageLayout('categorias');
    // console.log("Debug: Layout set to 'categorias'");
  } else {
    // Applies during loading, on error, or if type is unknown/null
    setPageLayout('default');
    // console.log("Debug: Layout set to 'default'");
  }
});

// --- Apply SEO using the composable ---
watchEffect(() => {
  // Only apply SEO if data is loaded successfully
  if (contentData.value && !error.value) {
    useSeoContent(contentData.value);
    // console.log("Debug: SEO applied via useSeoContent");
  }
  // Optional: Handle SEO for error state if needed, maybe set a generic error title/desc
  // else if (error.value) {
  //   useServerSeoMeta({ title: 'Error', description: 'Página no encontrada' });
  // }
});

// --- No manual definePageMeta or useHead for SEO needed here ---

</script>

<template>
  <div>
    <!-- Loading State -->
    <SharedLoader v-if="pending" />

    <!-- Content Rendering (Dynamic Component) -->
    <component
      v-else-if="resolvedComponent && contentData"
      :is="resolvedComponent"
      :data="contentData"
    />

    <!-- Error State -->
    <section v-else-if="error" class="text-red-500 text-center py-10 px-4">
      <h2>Error al cargar el contenido</h2>
      <p class="text-sm mt-2">{{ error?.message || 'Ha ocurrido un error inesperado.' }}</p>
      <!-- Consider adding a link back home or to retry -->
      <NuxtLink to="/" class="mt-4 inline-block text-primary hover:underline">Volver al inicio</NuxtLink>
    </section>

    <!-- Unknown/Unsupported Content Type State -->
    <section v-else-if="!pending" class="text-center py-10 px-4 text-muted-foreground">
      <!-- Checks !pending to avoid flashing this during initial load -->
      <h2>Contenido no encontrado o no soportado</h2>
      <p class="text-sm mt-2">El tipo de contenido solicitado no se pudo mostrar.</p>
       <NuxtLink to="/" class="mt-4 inline-block text-primary hover:underline">Volver al inicio</NuxtLink>
    </section>
  </div>
</template>