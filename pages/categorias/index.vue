// pages/categorias/index.vue
<template>
  <div>
    <header class="bg-gray-100 dark:bg-gray-800 py-8 mb-3">
      <div class="max-w-screen-xl mx-auto px-4">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          Nuestras Categorías de Productos
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Explora todas las soluciones de impresión que ofrecemos.
        </p>
      </div>
    </header>

    <!-- Sección principal que ahora usa CategoryGrid -->
    <section aria-labelledby="categories-title" class="pb-16">
      <div class="max-w-screen-xl mx-auto px-4">

        <!-- Manejo Simplificado de Carga/Error (basado en si hay datos) -->
        <!-- Nota: El composable actual no expone 'pending' o 'error' de useAsyncData -->
        <div v-if="!categories || categories.length === 0" class="text-center text-gray-500 py-10">
          <!-- Podrías poner un spinner aquí si quieres, pero no sabremos cuándo termina sin 'pending' -->
          <p>Cargando categorías o no hay categorías disponibles...</p>
        </div>

        <!-- Renderiza el componente CategoryGrid pasando las categorías -->
        <CategoryGrid v-else :categories="categories" />
      </div>
    </section>
    <UiCallAction class="mt-10"/>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'categorias'
})
// Importa el composable para obtener las categorías

import { useCategorias } from '@/composables/useCategorias'; // Ajusta la ruta si es necesario
import { useHead } from '#imports'

// Llama al composable para obtener los datos
// El composable devuelve { data: Ref<Categoria[]> }
// Desestructuramos 'data' y lo renombramos a 'categories' para claridad
const { data: categories } = await useCategorias();

// --- SEO ---
useHead({
  title: 'Categorías de Productos | Repro Disseny',
  meta: [
    { name: 'description', content: 'Explora todas las categorías de productos y servicios de impresión ofrecidos por Repro Disseny en Barcelona y Cataluña.' },
    { property: 'og:title', content: 'Categorías de Productos | Repro Disseny' },
    { property: 'og:description', content: 'Explora todas las categorías de productos y servicios de impresión ofrecidos por Repro Disseny.' },
  ]
})

</script>