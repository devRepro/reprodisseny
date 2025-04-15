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

const route = useRoute()
const categorySlug = route.params.category as string
const { data: page } = await useCategoriaBySlug(categorySlug)
</script>
