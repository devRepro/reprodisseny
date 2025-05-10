<script setup lang="ts">
import { useCategoriasHome } from '@/composables/useCategoriasHome'

const { data: categorias } = useCategoriasHome()
</script>

<template>
  <section class="py-10 px-4 md:px-12 max-w-screen-xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-gray-900">Todas las categorías</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      <NuxtLink
        v-for="categoria in categorias"
        :key="categoria._path"
        :to="categoria._path"
        class="group block rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden bg-white"
      >
        <img
          v-if="categoria.image"
          :src="categoria.image"
          :alt="categoria.alt || categoria.title"
          class="w-full h-48 object-cover"
          loading="lazy"
          decoding="async"
        />
        <div class="p-4">
          <h2 class="text-lg font-semibold group-hover:text-primary transition">
            {{ categoria.title }}
          </h2>
          <p class="text-sm text-gray-600 mt-1 line-clamp-3">
            {{ categoria.description }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
