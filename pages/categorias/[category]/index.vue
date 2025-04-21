<script setup lang="ts">
// 1. Layout y meta
definePageMeta({ layout: 'categorias' })

// 2. Rutas y fetch de contenido
import { useRoute } from 'vue-router'
import { useAsyncData } from '#app'


// 4. Obtener slug
const route = useRoute()
const slug  = route.params.category as string

// 5. Cargar la categoría (SSR), filtrando por slug
const { data: categoria, pending, error } = await useAsyncData('categoria', () =>
  queryCollection('categorias')
    .where('slug', '=', slug)
    .first()
)

// 6. Handler newsletter
function onSubscribe(formData: any) {
  console.log('Newsletter subscribe:', formData)
  // Aquí tu llamada real al endpoint
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-12">

    <!-- Estado de carga / error -->
    <div v-if="pending" class="text-center py-12">Cargando…</div>
    <div v-else-if="error || !categoria" class="text-center text-red-600 py-12">
      Error al cargar la categoría.
    </div>

    <!-- Si la categoría existe -->
    <div v-else>
      <!-- 1. Header -->
      <CategoryHeader
        :title="categoria.title"
        :description="categoria.description"
        :link="`/contacto?from=${categoria.slug}`"
        :image="`/img/categorias/${categoria.image}`"
        :alt="categoria.alt || categoria.title"
      />

      

      <!-- 3. Contenido SEO‑rich desde el MD -->
      <section class="prose mx-auto dark:prose-invert">
        <ContentRenderer :node="categoria.body" />
      </section>

    </div>
  </div>
</template>
