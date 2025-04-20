<script setup lang="ts">
import { useSearch } from '@/composables/useSearch'
import { useCategoriasNav } from '@/composables/useCategoriasNav'

const { data: categorias } = await useCategoriasNav()
const { searchOpen, closeSearch } = useSearch()
</script>

<template>
  <!-- Skip‑link para accesibilidad -->
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only px-4 py-2 bg-blue-600 text-white rounded"
  >Saltar al contenido</a>

  <div class="flex flex-col min-h-screen bg-white text-gray-900">
    <!-- HEADER -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
        <a href="/" class="flex items-center shrink-0" aria-label="Repro Disseny">
          <UiLogo class="h-10 w-auto" />
        </a>
        <div class="flex items-center gap-6">
          <UiCommandSearch v-if="searchOpen" @close="closeSearch" />
          <UiMenuHeaderContacto />
        </div>
      </div>
    </header>

    <!-- MEGA MENU -->
    <nav aria-label="Navegación principal" class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UiNavigationMenuMegaMenu :categorias="categorias || []" />
      </div>
    </nav>

    <!-- MAIN -->
    <main
      id="main-content"
      role="main"
      class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <slot />
    </main>

    <!-- FOOTER -->
    <footer class="bg-gray-800 text-gray-200">
      <UiFooter />
    </footer>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
.sr-only.focus\:not-sr-only:focus {
  position: static; width: auto; height: auto; overflow: visible;
  clip: auto; white-space: normal;
}
</style>
