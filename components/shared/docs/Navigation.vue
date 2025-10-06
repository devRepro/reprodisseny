<!-- components/Ui/Docs/Navigation.vue (alias UiDocsNavigation) -->

<template>
  <nav
    v-if="!pending && navigationTree?.length"
    class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
  >
    <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
      Documentación
    </h3>
    <UiDocsNavigationList :items="navigationTree" />
  </nav>

  <div v-else-if="pending" class="p-4 text-sm text-gray-500">Cargando navegación...</div>

  <div v-else class="p-4 text-sm text-red-500">
    Error al cargar navegación.
    <pre v-if="error">{{ error }}</pre>
  </div>
</template>

<script setup lang="ts">
import { useDocsNav } from '~/composables/useDocsNav'

const { data: navigationTree, pending, error } = await useDocsNav()
</script>


