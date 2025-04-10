<template>
  <div class="flex flex-col min-h-screen bg-white">
    <!-- Navbar -->
    <header class="py-4 shadow-md">
      <UiHeader />
    </header>
    
    <!-- Contenido principal de producto -->
    <main class="flex-1 container mx-auto px-4 py-8">
          <!-- Menú de navegación global -->
      <MenuBar />
      <!-- Aquí se insertará la página del producto -->
      <slot />
    </main>

    <!-- Footer -->
    <UiFooter />
  </div>
</template>

<script setup>
// No necesitamos cargar categorías aquí
</script>
