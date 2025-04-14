<!-- layouts/default.vue -->
<script setup lang="ts">
import { useSearch } from '@/composables/useSearch'

const { searchOpen, closeSearch } = useSearch()
</script>

<template>
  <div class="flex flex-col min-h-screen bg-white">
    <header class="py-4 shadow-md">
      <UiHeader />
      <UiCommandSearch v-if="searchOpen" @close="closeSearch" />
    </header>


    <main class="flex-1 container mx-auto px-4 py-8">
       <!--Cargamos menu de categorias MainMenu-->
      <MenuCat />
      <slot />
    </main>

    <UiFooter />
  </div>
</template>
