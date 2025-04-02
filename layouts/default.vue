<template>
  <div class="flex flex-col min-h-screen">
    <!-- Navbar -->
    <header class="py-4 shadow-md">
      <UiHeader />
    </header>
    
    <!-- Main Content Layout -->
    <main class="flex-1 container mx-auto px-4 py-8"> 
      
      <!-- Menú de navegación global -->
      <CategoryNav v-if="categories" :categories="categories" />
      <!--Cargamos contenido de la página-->
      <slot />
    </main>

    <!-- Footer -->
     <UiFooter />
  </div>
</template>

<script setup>

//Cargamos las categorias
const { data: categories } = await useCategoriasNav()

</script>


