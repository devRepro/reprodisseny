<script setup lang="ts">
import { useCategoriasNav } from '@/composables/useCategoriasNav'

const { data: categorias } = await useCategoriasNav()
</script>

<template>
  <NuxtLayout name="default">
    <template #navigation>
      <!-- reutiliza tu megamenu del default layout -->
      <UiNavigationMenuMegaMenu :categorias="categorias || []" />
    </template>
    <!-- aquí irá siempre el contenido de la página [category] -->
    <slot />
  </NuxtLayout>
</template>
