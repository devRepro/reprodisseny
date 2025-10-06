<!-- pages/index.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useCategoriasRoots } from "@/composables/useCategoriasRoots";
// Si no tienes auto-import de components, descomenta:
// import CategoryGrid from '@/components/category/Grid.vue'

const { data, pending, error } = useCategoriasRoots();

// ref -> computed para el template
const categories = computed(() => data.value?.items ?? []);
</script>

<template>
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-white">Hola mundo!</h1>
    <CategoryGrid :categories="categories" />
  </main>
</template>
