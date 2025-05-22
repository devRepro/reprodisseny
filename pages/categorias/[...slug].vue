<script setup lang="ts">
// 1) Imports mínimos
import { computed, watchEffect } from 'vue'
import { useRoute, setPageLayout } from '#imports'
import { useCategoriaData } from '@/composables/useCategoriaData'

// 2) Datos y rutas
const route = useRoute()
const { contentData, pending, error } = useCategoriaData()
const contentType = computed(() => contentData.value?.type)

// 3) Layout dinámico
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
