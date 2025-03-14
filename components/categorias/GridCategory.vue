<template>
  <section class="container mx-auto px-4 py-10">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-6">Nuestras Categorías</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="category in categories" :key="category.path" class="max-w-sm bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition">
        <NuxtImg :src="category.image" 
                 :alt="category.alt"
                 class="rounded-t-lg w-full h-48 object-cover" />
          <div class="p-5">
            <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900">{{ category.title }}</h5>
            <p class="mb-3 font-normal text-gray-700">{{ category.description }}</p>
            <NuxtLink :to="`categorias/${category.slug}`">
            <span class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              Ver más
              <svg class="w-4 h-4 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M6 10h8m0 0-3-3m3 3-3 3"></path>
              </svg>
            </span>
          </NuxtLink>
          </div>
      </div>
    </div>
  </section>
  <!-- TODO
   REvisar css
   
   -->
</template>

<script lang="ts" setup>
  //recuperamos todas las categorias guardadas en content/*.md
  const { data: categories } = await useAsyncData("categories-list", () => {
    return queryCollection("categorias")
      .select("title", "slug", "path", "description", "image", "alt")
      .all();
  });

</script>