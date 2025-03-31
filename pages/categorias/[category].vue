<template>
    <CategoryHeader
    :title="page?.title"
    :description="page?.description"
    :image="`/img/categorias/${page?.image}`"
    :alt="page?.alt"
    :link="`/categorias/${page?.slug}`"
  />
  <ContentRenderer v-if="page" :value="page" class="mb-10" />
  </template>

<script setup lang="ts">

const route = useRoute()
const myCategory = route.params.category as string

// Cargar la categoría
const { data: page } = await useAsyncData(`categoria-${myCategory}`, () => {
  return queryCollection('categorias')
  .path(`/categorias/${myCategory}`)
  .first()
})

</script>
