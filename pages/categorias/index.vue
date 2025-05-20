<script setup lang="ts">
import { useCategoriasHome } from '@/composables/useCategoriasHome'

const { data: categorias } = useCategoriasHome()
</script>

<template>

<CategoryGrid v-if="categorias" :categories="categorias || []" />
  
</template>
~/composables/useCategoriasHome.server