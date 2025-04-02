<!--Componente para cargar los productos de las categorias del menú principal-->

<template>
  <div>
    <ul v-if="productos.length">
      <li v-for="producto in productos" :key="producto._path">
        <NuxtLink :to="producto._path" class="hover:underline">
          {{ producto.title }}
        </NuxtLink>
      </li>
    </ul>
    <p v-else>Cargando productos...</p>
  </div>
</template>

<script setup lang="ts">

import { ref, watch } from 'vue'

const props = defineProps<{
  categoriaSlug: string
}>()

const productos = ref<any[]>([])

watch(
  () => props.categoriaSlug,
  async (slug) => {
    productos.value = await useProductosByCategoria(slug)
  },
  { immediate: true }
)
</script>
