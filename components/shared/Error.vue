<template>
  <div class="bg-red-100 text-red-700 px-4 py-3 rounded text-center" role="alert">
    <strong class="font-semibold">Error:</strong>
    <span class="block mt-1">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()

const props = withDefaults(defineProps<{ message?: string }>(), {
  message: 'Ha ocurrido un error inesperado.'
})
</script>
