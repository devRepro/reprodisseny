<script setup lang="ts">

  const { data: categories } = await useCategorias()

  

</script>

<template>
    
    <CategoryGrid v-if="categories" :categories="categories ?? []" />

    <UiFeatures />

</template>
