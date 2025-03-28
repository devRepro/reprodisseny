<template>
  <nav>
    <ul v-if="docs"
    class="flex justify-between categoryMenu"
    >
      <li v-for="item in docs[0].children" :key="item.path">
        <NuxtLink :to="item.path">{{ item.title }}</NuxtLink>
      </li>
    </ul>
  </nav>
</template>


<script setup lang="ts">

// Cargar categorías
const { data: docs } = await useAsyncData("documents-list", async () =>  {
  const categories = await queryCollectionNavigation("categorias", ["nav", "slug"]);
  return categories || [];
});


</script>

<style scoped>

  .categoryMenu {
    background-color: #333333;
    color: #fff;
  }
  .categoryMenu a {
    color: #fff;
  }

</style>