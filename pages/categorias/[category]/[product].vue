<template>
  <div v-if="producto" class="container mx-auto px-4 py-10">
    <!-- Layout principal en dos columnas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      
      <!-- Imagen del producto -->
      <div>
        <img
          v-if="producto.image"
          :src="producto.image"
          :alt="producto.alt || producto.title"
          class="rounded-xl shadow-md w-full object-cover"
        />
      </div>

      <!-- Info del producto -->
      <div class="space-y-6">
        <h1 class="text-4xl font-bold text-gray-800">{{ producto.title }}</h1>
        <p class="text-lg text-gray-600">{{ producto.description }}</p>

        <!-- Aquí podrías incluir opciones seleccionables en el futuro -->
        <h2>asfasfas</h2>
 
      </div>
    </div>

    <!-- Contenido extendido desde el Markdown -->
    <div class="prose max-w-4xl mx-auto mt-16">
      <ContentRenderer :value="producto" />
    </div>
  </div>
  
  <!-- Estado de carga -->
  <div v-else class="text-center py-20">
    <p class="text-xl text-gray-500">Cargando producto o no encontrado…</p>
  </div>
</template>

<script lang="ts" setup>

//definimos el layout
definePageMeta({
  layout: 'producto'
})

import { ref, watchEffect } from 'vue'

const route = useRoute()
const producto = ref(null)

// Cargar el producto según categoría y slug
watchEffect(async () => {
  const category = route.params.category
  const slug = route.params.product

  if (category && slug) {
    const data = await queryCollection('categorias')
      .where('type', '=', 'producto')
      .where('category', '=', category)
      .where('slug', '=', slug)
      .first()

    producto.value = data
  }
})

// SEO dinámico
useSeoMeta({
  title: () => producto.value?.metatitle || producto.value?.title,
  description: () => producto.value?.metadescription || producto.value?.description,
  ogTitle: () => producto.value?.title,
  ogDescription: () => producto.value?.description,
  ogImage: () => producto.value?.image,
})
</script>
