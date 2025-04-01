<template>
  <section class="container mx-auto px-4 py-10">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-6">Nuestras Categorías</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div 
        v-for="category in categories" 
        :key="category._path"
        class="group flex flex-col bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 h-full overflow-hidden"
      >
        <!-- Imagen con overlay y efecto zoom en hover -->
        <div class="relative">
          <NuxtImg 
            :src="`/img/categorias/${category.image}`"  
            :alt="category.alt"
            priority
            class="w-full h-48 object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </div>
        <!-- Contenedor del título -->
        <div class="p-4 flex flex-col items-center">
          <h5 class="text-lg md:text-xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-primary">
            <NuxtLink :to="`/categorias/${category.slug}`">{{ category.nav }}</NuxtLink>
          </h5>
        </div>
      </div>
    </div>
  </section>
</template>
  
<script setup lang="ts">
defineProps<{
  categories: {
    title: string
    nav: string
    slug: string
    _path: string
    description?: string
    image?: string
    alt?: string
  }[]
}>()
</script>
