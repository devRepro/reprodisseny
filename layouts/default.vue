<template>
  <div class="flex flex-col min-h-screen">
    <!-- Navbar -->
    <header class="py-4 shadow-md">
      <UiHeader />
    </header>
    
    <!-- Main Content Layout -->
    <main class="flex-1 container mx-auto px-4 py-8"> 
      <!--Menú navegación categorias-->
      <CategoryNav />
      <slot />
    </main>

    <!-- Footer -->
     <UiFooter />
  </div>
</template>
<script setup>
import { UiFooter } from '#components';


</script>


