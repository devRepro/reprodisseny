<template>
  <div>
    <ContentRenderer :value="doc" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'


const route = useRoute()
const slug = route.params.slug

const { data: doc } = await useAsyncData(`document-${slug}`, async () => {
  const result = await queryCollection('categorias')
    .where({ _path: `/categorias/${slug}` }) // Filtrar por slug
    .findOne()

  console.log("Cargando categoría:", slug, "Resultado:", result);
  return result;
});
</script>

