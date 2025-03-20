<template>
  <div v-if="category">
    <ContentRenderer :value="category.body" />
  </div>
  <div v-else>
    <p>Contenido no encontrado</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

// Obtener el parámetro 'slug' de la URL
const route = useRoute()
const slug = route.params.slug

// Consultar el contenido del archivo Markdown correspondiente al slug
const { data: category } = await useAsyncData('category', () => 
  queryCollection('categorias')
  .where('slug', '=', slug )
  .select('title', 'nav', 'body') //Filtrar por slug
  .first() //Obtengo resultado  

);
</script>

