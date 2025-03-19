<template>
  <div v-if="doc">
    <NuxtLoadingIndicator />
     <!-- Render the blog post as Prose & Vue components -->
  <ContentRenderer :value="doc || {}" />
</div>
<div v-else>
  <p>Cargando....</p>
</div>
</template>

<script setup lang="ts">

import { useRoute } from 'vue-router'
//cargamos las categorias dinámicamente
const route = useRoute();
const slug = route.params.slug 

const { data: doc } = await useAsyncData(`document-${slug}`, () => {
  return queryCollection('categorias')
    .where('path', '=', `/categorias/${slug}`) // Filtrar por slug
    .first() // Suponiendo que solo haya un resultado
})

</script>

