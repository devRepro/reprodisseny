<script setup lang="ts">
import { useSearch } from '@/composables/useSearch'
import { useCategoriasStore } from '~/stores/categorias'

// Instanciar store
const categoriasStore = useCategoriasStore()

// Preload SSR/cliente con fallback y datos cacheados
const { data: categorias } = await useAsyncData(
  'categorias',
  async () => {
    if (!categoriasStore.loaded) {
      await categoriasStore.fetchCategorias()
    }
    return categoriasStore.menu
  },
  {
    // Previene errores si no hay datos
    default: () => [],
    // Opcional: puedes transformar los datos aquí si quisieras
    transform: (menu) => menu.sort((a, b) => a.nav?.localeCompare(b.nav ?? '') ?? 0)
  }
)

// Sync store con data (por si viene del SSR y no del store directo)
if (!categoriasStore.loaded && categorias.value?.length) {
  categoriasStore.menu = categorias.value
  categoriasStore.loaded = true
}

// Composable de búsqueda
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
