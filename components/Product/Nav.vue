<script setup lang="ts">


const { data: products } = await useAsyncData("products-in-category", async () => {
  const items = await queryCollectionNavigation("categorias/adhesivos", ["title", "slug", "nav"]);
  return items || [];
});


</script>
<template>

{{ products }}

</template>
