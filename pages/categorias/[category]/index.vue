<template>
  <div>
    <CategoryHeader v-if="page" :title="page.title" :description="page.description"
      :image="`/img/categorias/${page.image}`" :alt="page.alt" :link="`/categorias/${page.slug}`" />

    <UiSpinner v-else />

    <ProductSection v-if="productos?.length" :items="productos" id="productos" />
    <ContentRenderer v-if="page" :value="page" class="mb-10" />
    <UiCallAction />

    <div v-if="page?.meta?.faqs?.length">
      <UiFaqSection :faqs="page.meta.faqs" />
    </div>
    <div v-else>
      <p>No hay preguntas frecuentes disponibles.</p> 
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'categorias'
})

import { useRoute } from 'vue-router'
import { useCategoriaBySlug } from '@/composables/useCategoriaBySlug'
import { useProductosByCategoria } from '@/composables/useProductosByCategoria'
import { useStructuredData } from '@/composables/useStructuredData'
import { computed, onMounted } from 'vue'

const route = useRoute()
const categorySlug = route.params.category as string

const { data: page } = await useCategoriaBySlug(categorySlug)
const { data: productos } = await useProductosByCategoria(categorySlug)

onMounted(() => {
  console.log('Page data:', page.value); // <-- AÑADE ESTA LÍNEA AQUÍ
});

const structuredData = computed(() =>
  page.value ? useStructuredData({
    title: page.value.title,
    description: page.value.description,
    image: `/img/categorias/${page.value.image}`
  }) : null
)

useHead(() => ({
  title: page.value?.metatitle || page.value?.title,
  meta: [
    {
      name: 'description',
      content: page.value?.metadescription || page.value?.description
    },
    {
      name: 'keywords',
      content: Array.isArray(page.value?.keywords)
        ? page.value.keywords.join(', ')
        : typeof page.value?.keywords === 'string'
          ? page.value.keywords
          : ''
    },
    {
      property: 'og:title',
      content: page.value?.metatitle || page.value?.title
    },
    {
      property: 'og:description',
      content: page.value?.metadescription || page.value?.description
    },
    {
      property: 'og:image',
      content: `https://reprodisseny.com${page.value?.image}`
    }
  ],
  script: page.value?.structuredData
    ? [
      {
        type: 'application/ld+json',
        children: page.value.structuredData
      }
    ]
    : []
}))
</script>
