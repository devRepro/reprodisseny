<script setup lang="ts">

  const { data: categories } = await useCategorias()
</script>
<template>
  <div>
    <UiSliderHome /> 
    <CategoryCarrousel v-if="categories" :categories="categories ?? []" />
    <FeaturesSection />
    <UiFeatures />
  </div>  
</template>
