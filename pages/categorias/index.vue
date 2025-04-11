<!-- pages/categorias/index.vue -->
<template>
    <section class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Todas las categorías</h1>
      <CategoryGrid />
    </section>
  </template>
  
  <script setup>

  
  definePageMeta({
    layout: 'categorias'
  })
  </script>