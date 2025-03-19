<template>
  <section class="container mx-auto px-4 py-10">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-6">Nuestras Categorías</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="category in categories" :key="category.path"
        class="group flex flex-col max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 h-full overflow-hidden">

        <!-- Imagen con overlay al pasar el mouse -->
        <div class="relative w-full h-48">
          <NuxtImg :src="category.image" :alt="category.alt"
            class="w-full h-full object-cover rounded-t-2xl transition-opacity duration-300 group-hover:opacity-80" />
        </div>

        <!-- Contenedor del título -->
        <div class="p-4 bg-white flex flex-col items-center">

          <!-- Título en negrita -->
          <h5
            class="text-lg md:text-xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-primary">
            <NuxtLink :to="category.path">{{ category.nav }}</NuxtLink>
          </h5>

        </div>
      </div>
    </div>
  </section>
</template>


<script lang="ts" setup>
//recuperamos todas las categorias guardadas en content/*.md
const { data: categories } = await useAsyncData("categories-list", () => {
  return queryCollection("categorias")
    .select("title", "nav", "slug", "path", "description", "image", "alt")
    .all();
});

</script>