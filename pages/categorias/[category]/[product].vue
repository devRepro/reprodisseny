<template>
  <div v-if="producto" class="container mx-auto px-4 py-12">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      
      <!-- Imagen destacada -->
      <div>
        <NuxtImg
          v-if="producto.image"
          :src="producto.image"
          :alt="producto.alt || producto.title"
          class="rounded-2xl shadow-lg w-full h-auto object-cover"
          width="800"
          height="600"
        />
      </div>

      <!-- Información del producto -->
      <div class="space-y-6">
        <h1 class="text-4xl font-bold text-gray-900 leading-tight">{{ producto.title }}</h1>
        <!-- Formulario de contacto -->
        <UiFormsProduct 
          :title="producto.title" 
          :formFields="producto.formFields" 
        />
     
        <div class="flex flex-wrap gap-4 text-sm text-gray-500">
          <p class="text-lg text-gray-600">{{ producto.description }}</p>
        </div>
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
definePageMeta({
  layout: 'producto'
})

import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'        
import { computed } from 'vue'; 
import { 
  useAsyncData, 
  useSeoMeta, 
  useHead,    
  createError
} from '#imports'; 

// definimos layout
definePageMeta({ layout: 'producto' })

// --- Obtención de Datos (Asumiendo que funciona) ---
const route = useRoute();
const path = route.path; 
const producto = ref(null)
const loading = ref(true)


// --- Lógica SEO y Head (SOLO SI page.value existe) ---
if (producto.value) {
  const pageTitle = computed(() => producto.value?.metaTitle || producto.value?.title || 'Producto');
  const pageDescription = computed(() => producto.value?.metaDescription || producto.value?.description || '');
  const baseUrl = 'https://reprodisseny.com';
  const canonicalUrl = computed(() => `${baseUrl}${route.path}`);
  const seoImageUrl = computed(() => {
    if (producto.value?.schema?.image) return producto.value.schema.image; 
    if (producto.value?.image) return `${baseUrl}${producto.value.image}`; 
    return `${baseUrl}/og-image.jpg`;
  });

  useSeoMeta({
    title: pageTitle.value,
    description: pageDescription.value,
    ogTitle: pageTitle.value,
    ogDescription: pageDescription.value,
    ogUrl: canonicalUrl.value,
    ogImage: seoImageUrl.value,
    ogType: 'product',
    twitterCard: 'summary_large_image',
    twitterTitle: pageTitle.value,
    twitterDescription: pageDescription.value,
    twitterImage: seoImageUrl.value,
  });

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl.value }],
    script: producto.value.schema
      ? [{
          key: 'product-schema',
          type: 'application/ld+json',
          innerHTML: JSON.stringify(producto.value.schema)
        }]
      : [],
  });
} else {
  useHead({ title: 'Producto no encontrado' });
}



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
    loading.value = false
  }
})

</script>
