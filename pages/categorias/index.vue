<!-- pages/index.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useCategoriasGrid } from "@/composables/useCategoriasGrid";

const { data, pending, error } = useCategoriasGrid();
const categories = computed(() => data.value?.items ?? []);
</script>

<template>
  <main class="container mx-auto px-4 py-8 space-y-6">
    <SharedMenuCategories />
    <div v-if="pending">Cargando categorías…</div>
    <div v-else-if="error">Error: {{ error?.message || String(error) }}</div>
    <template v-else>
      <SharedGridDisplay
        v-if="categories.length"
        :items="categories"
        :keyFn="(c) => c.path"
        :titleFn="(c) => c.nav || c.title"
        :linkFn="(c) => c.path"
        :imageFn="(c) => c.image?.src || ''"
      />
      <p v-else class="text-sm text-muted-foreground">No hay categorías para mostrar.</p>
    </template>
  </main>
</template>
