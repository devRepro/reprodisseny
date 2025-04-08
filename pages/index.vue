<script setup lang="ts">


  const { data: categories } = await useCategorias()

  

</script>

<template>
    <UiSliderHome />
    <div>
    <Test />
    <div class="bg-primary text-light hover:bg-primary/80">
  Prueba de fondo azul con opacidad en hover
</div>
  </div>
    <CategoryCarrousel v-if="categories" :categories="categories ?? []" />
    <FeaturesSection />
    <UiFeatures />

</template>
