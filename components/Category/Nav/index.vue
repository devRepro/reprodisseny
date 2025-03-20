<!--Menu navegación categorias-->
<template>
   <nav class="categoryMenu__block">
    <ul v-if="docs && docs[0]?.children" class="flex justify-between w-full">
      <li v-for="doc in docs[0].children" :key="doc.path" class="categoryMenu__item">
        <NuxtLink :to="doc._path" class="categoryMenu__link">
          {{ doc.nav }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
     
     const { data: docs } = await useAsyncData("documents-list", () =>
  queryCollectionNavigation("categorias", ["nav"])
);

</script>

<style scoped>


.categoryMenu__block {
  background: #1a1c20;
  border-radius: 4px;
  color: #FFF;
  display: flex;
  font-size: 14px;
  gap: 10px;
  padding: 8px 16px;
}
.categoryMenu__item {
  list-style: none;
}
.categoryMenu__link {
  display: flex;
  align-items: center;
  color: #ffffff;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.3s ease-in-out;
}
.categoryMenu__link:hover {
  background: #333;
}
</style>
