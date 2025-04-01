<script lang="ts" setup>
import { ref, watchEffect } from 'vue'

const route = useRoute()
const producto = ref(null) // <-- aquí defines el ref

// Cargar el producto cuando cambien los parámetros
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

<template>
  <div v-if="producto" class="container mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold mb-4">{{ producto.title }}</h1>
    <p class="text-lg text-gray-600 mb-4">{{ producto.description }}</p>

    <img
      v-if="producto.image"
      :src="producto.image"
      :alt="producto.alt"
      class="w-full max-w-md mb-6"
    />

    <ContentRenderer :value="producto" />
    <div>
      <UiFormsProduct />
    </div>
  </div>
    
  <div v-else class="text-center py-20">
    <p class="text-xl text-gray-500">Cargando producto o no encontrado…</p>
  </div>
</template>
