<template>
  <div class="flex justify-center items-center py-10" role="status" aria-busy="true">
    <svg
      class="animate-spin h-8 w-8 text-primary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
    <span class="sr-only">Cargando…</span>
  </div>
</template>

<script setup lang="ts">
// No props ni emits: componente puro y reutilizable
</script>
