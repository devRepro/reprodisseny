<!-- layouts/default.vue -->
<script setup lang="ts">

import { useSearch } from '@/composables/useSearch'
import { useCategoriasNav } from '@/composables/useCategoriasNav'


const { data: categorias, pending, error } = await useCategoriasNav()
const { searchOpen, closeSearch } = useSearch()
</script>

<template>
  <div class="flex flex-col min-h-screen bg-white">
    <!-- HEADER: también centrado dentro del container -->
    <header class="py-4 shadow-md bg-white">
      <div class="container mx-auto px-4">
        <UiHeader />
        <UiCommandSearch v-if="searchOpen" @close="closeSearch" />
      </div>
    </header>

    <!-- MEGA MENU: alineado con el contenido -->
    <div class="bg-white border-b">
      <div class="container mx-auto px-4">
        <UiNavigationMenuMegaMenu :categorias="categorias" />
      </div>
    </div>

    <!-- MAIN: slider / contenido -->
    <main class="flex-1 container mx-auto px-4 py-8">
      <slot />
    </main>

    <UiFooter />
  </div>
</template>