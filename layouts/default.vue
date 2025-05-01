<script setup lang="ts">
import { useSearch } from '@/composables/useSearch'
import { useCategoriasStore } from '~/stores/categorias'


const categoriasStore = useCategoriasStore()

// Cargar categorías al inicio (solo si no están cargadas)
onMounted(() => {
  if (!categoriasStore.loaded) {
    categoriasStore.fetchCategorias()
  }
})



const { searchOpen, closeSearch } = useSearch()
</script>

<template>
  <div class="flex flex-col min-h-screen bg-white">
    <!-- Header -->
    <header class="bg-white shadow-md">
      <div class="container mx-auto px-4 py-4">
        <UiHeader />
        <UiCommandSearch v-if="searchOpen" @close="closeSearch" />
      </div>
    </header>

    <!-- MegaMenu / Nav -->
    <div class="bg-white border-b">
      <div class="container mx-auto px-4">
        <template v-if="categoriasStore.loaded">
          <SharedMenu :categorias="categoriasStore.menu" />
        </template>
        <template v-else>
          <p class="text-center py-4">Cargando menú…</p>
        </template>
      </div>
    </div>

    <!-- Página actual -->
    <main class="flex-1 container mx-auto px-4 py-8">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <UiFooter />
  </div>
</template>
