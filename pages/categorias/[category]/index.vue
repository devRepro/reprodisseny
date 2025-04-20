<script setup lang="ts">
definePageMeta({ layout: 'categorias' })

import { useRoute } from 'vue-router'
import { useCategoriaBySlug } from '@/composables/useCategoriaBySlug'

const route   = useRoute()
const slug    = route.params.category as string
const { data: categoria, pending, error } = useCategoriaBySlug(slug)

// DEBUG: comprueba en consola
console.log('slug:', slug)
console.log('categoria.value:', categoria.value)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div v-if="pending" class="text-center py-12">Cargando…</div>
    <div v-else-if="error" class="text-center text-red-600 py-12">
      Error al cargar la categoría.
    </div>
    <div v-else-if="categoria">
      <!-- Renderizamos solo el header por ahora -->
      <CategoryHeader :categoria="categoria" />
    </div>
  </div>
</template>

<style scoped>
/* Centrado y espacios básicos ya definidos en el container */
</style>
