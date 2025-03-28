<template>
  <div v-if="category">
     <!-- Usamos el componente reutilizable y le pasamos las props -->
    <ContentRenderer :value="category.body" />
  </div>
  <div v-else>
    <p>Contenido no encontrado</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { watch } from 'vue'
// Obtener el parámetro 'slug' de la URL
const route = useRoute()
const slug = route.params.slug

const fetchCategory = () => {
  return queryCollection('categorias')
    .where('slug', '=', slug)
    .select('title', 'nav', 'slug', 'image', 'body')
    .first()
}

// Carga inicial
const { data: category, refresh } = await useAsyncData('category', fetchCategory)

// Recargar si cambia el slug (por navegación interna)
watch(() => route.params.slug, () => {
  refresh()
})

</script>

