<script setup lang="ts">
import { useCategoriasNav } from '@/composables/useCategoriasNav'

const { data: categorias } = await useCategoriasNav()
</script>

<template>
  <NuxtLayout name="default">
    <template>
      <!-- reutiliza tu megamenu del default layout -->
      <UiNavigationMenuMegaMenu/>
    </template>
    <!-- aquí irá siempre el contenido de la página [category] -->
    <slot />
  </NuxtLayout>
</template>
