<script setup lang="ts">

// Cargar categorías
const { data: docs } = await useAsyncData("documents-list", async () =>  {
  const categories = await queryCollectionNavigation("categorias", ["navigation", "slug"]);
  return categories || [];
});

</script>

<template>

<nav>
    <ul v-if="docs">
      <li v-for="item in  docs[0].children" :key="item.path">
        <NuxtLink :to="item.path">
          {{ item.title }}
        </NuxtLink>
      </li>
    </ul>
  </nav>


</template>