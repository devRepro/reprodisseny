<template>
    <section class="container mx-auto px-4 py-10">
      <h2 class="text-3xl font-bold text-gray-900 text-center mb-6">Nuestras Categorías</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="category in categories" 
             :key="category.path" 
             class="flex flex-col max-w-sm bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition h-full">
          
          <!-- Imagen -->
          <NuxtImg :src="category.image" 
                   :alt="category.alt"
                   class="rounded-t-lg w-full h-48 object-cover" />
  
          <!-- Contenedor flexible para distribuir elementos -->
          <div class="p-5 flex flex-col flex-grow justify-between">
            
            <!-- Título -->
            <h5 class="text-xl font-bold tracking-tight text-gray-900">
              {{ category.title }}
            </h5>
            
            <!-- Descripción -->
            <p class="font-normal text-gray-700 flex-grow">
              {{ category.description }}
            </p>
  
            <!-- Botón "Ver más" alineado abajo -->
            
            <UiButton :to="category.path" replace :text="'Más información'" />
          </div>
        </div>
      </div>
    </section>
  </template>
  
  
  <script lang="ts" setup>
    //recuperamos todas las categorias guardadas en content/*.md
    const { data: categories } = await useAsyncData("categories-list", () => {
      return queryCollection("categorias")
        .select("title", "slug", "path", "description", "image", "alt")
        .all();
    });
  
  </script>