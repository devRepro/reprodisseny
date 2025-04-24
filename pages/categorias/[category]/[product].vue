<template>
  <div v-if="producto" class="container mx-auto px-4 py-12">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      
      <!-- Imagen destacada -->
      <ProductImageGallery :images="producto.images" />
      
      <!-- Información del producto -->
      <div class="space-y-6">
        <h1 class="text-4xl font-bold text-gray-900 leading-tight">{{ producto.title }}</h1>
        <p class="text-lg text-gray-600">{{ producto.description }}</p>

        <ProductDetails :product="producto" />

        <!-- Formulario dinámico si hay campos -->
        <UiFormsProduct
          v-if="producto.formFields"
          :fields="producto.formFields"
          :product="producto"
        />
      </div>
    </div>

    <!-- Contenido extendido (desde .md) -->
    <div class="prose max-w-4xl mx-auto mt-16">
      <ContentRenderer :value="producto" />
    </div>

    <!-- FAQ -->
    <div v-if="producto.faqs?.length" class="max-w-4xl mx-auto mt-16 space-y-6">
      <h2 class="text-2xl font-semibold">Preguntas frecuentes</h2>
      <ul class="space-y-4">
        <li v-for="(faq, i) in producto.faqs" :key="i" class="border rounded-lg p-4 bg-gray-50">
          <strong class="block">{{ faq.question }}</strong>
          <p class="text-sm mt-1 text-gray-700">{{ faq.answer }}</p>
        </li>
      </ul>
    </div>
  </div>

  <!-- Loading -->
  <div v-else-if="loading" class="text-center py-20">
    <UiSpinner />
  </div>

  <!-- No encontrado -->
  <div v-else class="text-center py-20">
    <p class="text-xl text-gray-500">Producto no encontrado…</p>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'producto' })

import { ref, watchEffect } from 'vue'

const route = useRoute()
const producto = ref(null)
const loading = ref(true)

watchEffect(async () => {
  const category = route.params.category
  const slug = route.params.product

  if (category && slug) {
    const data = await queryCollection('categorias')
      .where('type', '=', 'producto')
      .where('category', '=', category)
      .where('slug', '=', slug)
      .first()

    loading.value = false
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