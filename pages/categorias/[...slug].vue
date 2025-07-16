<!-- pages/categorias/[...slug].vue -->
<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute, setPageLayout } from '#imports'
import { useCategoriaData } from '@/composables/useCategoriaData'

// 1) Normaliza el slug desde la ruta
const route    = useRoute()
const fullSlug = computed<string>(() => {
  const s = route.params.slug
  return Array.isArray(s) ? s.join('/') : (s as string) || ''
})

// 2) Llama al composable pasándole ese Ref
const { contentData, pending, error } = useCategoriaData(fullSlug)
const contentType = computed(() => contentData.value?.type)

// 3) Layout dinámico (esto sí está dentro de setup)
watchEffect(() => {
  setPageLayout(
    contentType.value === 'producto' ? 'productos' : 'categorias'
  )
})
</script>

<template>
  <SharedAppCrumbs />

  <ViewCategoria
    v-if="contentType === 'categoria'"
    :data="contentData"
  />
  <ViewSubcategoria
    v-else-if="contentType === 'subcategoria'"
    :data="contentData"
  />
  <ViewProducto
    v-else-if="contentType === 'producto'"
    :data="contentData"
  />

  <div v-if="pending" class="text-center py-10">Cargando…</div>
  <div v-else-if="error" class="text-center py-10 text-red-500">
    Error: {{ error.message }}
  </div>
</template>

