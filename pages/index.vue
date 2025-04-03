<script setup lang="ts">


  const { data: categories } = await useCategorias()

  

</script>

<template>
    <UiSliderHome />
    <CategoryCarrousel v-if="categories" :categories="categories ?? []" />
    <FeaturesSection />
    <UiFeatures />

</template>
