<template>
  <section class="container mx-auto px-4 py-10">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">Conoce Nuestras Categorías</h2>

    <div class="flex gap-6 overflow-x-auto pb-4 hide-scrollbar max-w-full">
      <div
        v-for="category in categories"
        :key="category._path"
        class="flex-shrink-0 w-64 rounded-2xl border border-gray-200 shadow hover:shadow-lg transition duration-300 bg-white group"
      >
        <NuxtLink :to="`/categorias/${category.slug}`" class="block">
          <!-- Imagen -->
          <div class="relative w-full h-40 overflow-hidden rounded-t-2xl">
            <NuxtImg
              :src="`/img/categorias/${category.image}`"
              :alt="category.alt || category.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          </div>

          <!-- Título -->
          <div class="p-4 text-center">
            <h3 class="text-base font-semibold text-gray-800 group-hover:text-primary">
              {{ category.nav }}
            </h3>
          </div>
        </NuxtLink>
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

<style scoped lang="scss">
/* Oculta la barra de scroll horizontal visualmente pero permite el scroll */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE y Edge */
  scrollbar-width: none;     /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;             /* Chrome, Safari */
}
</style>
