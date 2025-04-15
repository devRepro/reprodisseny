<!-- layouts/docs.vue -->
<template>
  <div class="flex flex-col min-h-screen">
    <header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <!-- Asegúrate que la ruta a UiHeader sea correcta -->
      <UiHeader />
    </header>

    <div class="container mx-auto flex-1 w-full px-4 py-8">
      <div class="flex flex-col lg:flex-row lg:gap-10">

        <!-- Barra Lateral de Navegación (Sidebar) -->
        <aside class="w-full lg:w-64 lg:sticky lg:top-20 lg:self-start mb-8 lg:mb-0">
          <!-- Usamos la ruta que especificaste -->
          <UiDocsNavigation />
        </aside>

        <!-- Área de Contenido Principal -->
        <main class="flex-1 min-w-0">
          <slot />
        </main>

      </div>
    </div>

    <!-- Asegúrate que la ruta a UiFooter sea correcta -->
    <UiFooter />
  </div>
</template>

<script setup lang="ts">


</script>

<style scoped>
.lg\:sticky {
  max-height: calc(100vh - 5rem); /* Ajusta 5rem según altura del header */
  overflow-y: auto;
}
</style>