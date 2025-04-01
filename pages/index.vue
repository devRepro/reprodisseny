<script setup lang="ts">

const { data: categories } = await useCategorias()
</script>

<template>
  <div>
    <CategoryNav />
    <CategoryGrid v-if="categories" :categories="categories" />
    <UiFeatures />
  </div>
</template>
