<script setup lang="ts">


  const { data: categories } = await useCategorias()

  

</script>

<template>
    <UiSliderHome />
    <CategoryGrid v-if="categories" :categories="categories ?? []" />
    <FeaturesSection />
    <UiFeatures />

</template>
