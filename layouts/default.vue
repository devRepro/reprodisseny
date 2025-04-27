<!-- layouts/default.vue -->
<script setup lang="ts">
import { useSearch } from '@/composables/useSearch'
import { useCategoriasNav } from '@/composables/useCategoriasNav'

// NO usar await aquí directamente
const { data: categorias, pending, error } = useCategoriasNav();
const { searchOpen, closeSearch } = useSearch()

// Proporcionar la ref reactiva completa
provide('categoriasGlobalRef', { categorias, pending, error });

// Opcional: log para depuración
watch(error, (newError) => {
  if (newError) {
    console.error("Error cargando categorías de navegación en layout:", newError);
  }
});
</script>

<template>
  <div class="flex flex-col min-h-screen bg-white">
    <header class="py-4 shadow-md bg-white">
      <div class="container mx-auto px-4">
        <UiHeader />
        <UiCommandSearch v-if="searchOpen" @close="closeSearch" />
      </div>
    </header>

    <!-- MEGA MENU: Manejar estado de carga/error -->
    <div class="bg-white border-b">
      <div class="container mx-auto px-4">
        <div v-if="pending" class="text-center py-4">Cargando menú...</div>
        <div v-else-if="error" class="text-center py-4 text-red-500">Error al cargar menú.</div>
        <!-- Renderiza solo si no hay error y tenemos categorías -->
        <UiNavigationMenuMegaMenu v-else-if="categorias" :categorias="categorias" />
      </div>
    </div>

    <main class="flex-1 container mx-auto px-4 py-8">
      <!-- El slot se renderizará independientemente de la carga de categorías -->
      <slot />
    </main>

    <UiFooter />
  </div>
</template>