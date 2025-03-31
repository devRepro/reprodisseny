<template v-if="products">
    
    <div v-if="products && products.length">
    <div v-for="product in products" :key="product._path">
      <h2>{{ product.title }}</h2>
    </div>
  </div>
  <p v-else>Cargando productos o no hay archivos...</p>
   
  </template>
  
  <script setup lang="ts">
  import { defineProps } from 'vue'
  
  const props = defineProps<{ category: string }>()
  
  const { data: products } = await useAsyncData(`/categorias/${props.category}`, () => {
  return queryCollection('categorias')
    .path(`/categorias/${props.category}`)
    .find()
})
  </script>
  