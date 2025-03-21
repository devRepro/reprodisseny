<template>
    <div class="product-list">
      <ProductCard v-for="producto in productos" :key="producto.id" :producto="producto" />
    </div>
  </template>
  
  <script setup>
  
  defineProps({
    productos: {
      type: Array,
      required: true
    }
  })
  </script>