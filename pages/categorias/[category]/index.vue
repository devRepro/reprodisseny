<template>
  <div>
    <CategoryHeader
      v-if="page"
      :title="page.title"
      :description="page.description"
      :image="`/img/categorias/${page.image}`"
      :alt="page.alt"
      :link="`/categorias/${page.slug}`"
    />

    <UiSpinner v-else />

    <ContentRenderer v-if="page" :value="page" class="mb-10" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'categorias'
})

import { useRoute } from 'vue-router'
import { useCategoriaBySlug } from '@/composables/useCategoriaBySlug'
import { useHead } from '#imports'

const route = useRoute()
const categorySlug = route.params.category as string

const { data: page } = await useCategoriaBySlug(categorySlug)

useHead(() => ({
  title: page.value?.metaTitle || page.value?.title,
  meta: [
    {
      name: 'description',
      content: page.value?.metaDescription || page.value?.description
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
      content: page.value?.metaTitle || page.value?.title
    },
    {
      property: 'og:description',
      content: page.value?.metaDescription || page.value?.description
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
