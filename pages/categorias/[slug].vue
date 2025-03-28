<template>
  <ContentRenderer v-if="category?.body" :value="category.body" />
  <p v-else-if="!pending">Contenido no encontrado</p>
  <p v-else>Cargando...</p>
</template>

<script setup lang="ts">
const route = useRoute()

const { data: category, pending } = await useAsyncData(
  `category-${route.params.slug}`,
  () =>
    queryContent(`/categorias/${route.params.slug}/index`)
      .only(['title', 'body', 'image', 'nav', 'slug'])
      .findOne()
)
</script>
