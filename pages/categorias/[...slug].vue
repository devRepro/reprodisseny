<script setup lang="ts">
// --- Imports ---
import { computed, watchEffect, useRuntimeConfig } from '#imports'
import { setPageLayout } from '#imports'
import { useCategoriaData } from '@/composables/useCategoriaData'
import CategoryVistaCategoria from '@/components/category/vista/Categoria.vue'
import CategoryVistaProducto from '@/components/category/vista/Producto.vue'
import CategoryVistaSubcategoria from '@/components/category/vista/Subcategoria.vue'

// --- Fetch Data ---
const { contentData, pending, error } = useCategoriaData()

// --- Tipo de contenido ---
const contentType = computed(() => contentData.value?.type || null)

const componentMap = {
  categoria: CategoryVistaCategoria,
  producto: CategoryVistaProducto,
  subcategoria: CategoryVistaSubcategoria
} as const

const resolvedComponent = computed(() => {
  const type = contentType.value
  return type ? componentMap[type as keyof typeof componentMap] : null
})

// --- Layout dinámico (solo en cliente para evitar hydration errors) ---
if (process.client) {
  watchEffect(() => {
    const type = contentData.value?.type
    if (type === 'producto') setPageLayout('productos')
    else if (type === 'categoria' || type === 'subcategoria') setPageLayout('categorias')
    else setPageLayout('default')
  })
}

// --- SEO dinámico ---
defineSeoMeta(() => {
  const data = contentData.value
  const config = useRuntimeConfig().public

  if (!data || pending.value || error.value) return {}

  return {
    title: data.metaTitle || data.title,
    description: data.metaDescription || data.description,
    ogTitle: data.metaTitle || data.title,
    ogDescription: data.metaDescription || data.description,
    ogImage: data.image?.startsWith('http')
      ? data.image
      : data.image
      ? `${config.siteUrl}/img/${data.type === 'producto' ? 'productos' : 'categorias'}/${data.image}`
      : undefined,
    twitterCard: 'summary_large_image'
  }
})

// --- Schema.org (solo si hay schema definido en el .md) ---
defineSchemaOrg(() => {
  const data = contentData.value
  if (!data || error.value || !data.schema) return []
  return [data.schema]
})
</script>

<template>
  <div class="category-product-page">
    <!-- Loader -->
    <div v-if="pending" class="text-center py-10">Cargando…</div>

    <!-- Contenido -->
    <component :is="resolvedComponent" v-else-if="contentData" :data="contentData" />

    <!-- Tipo desconocido -->
    <div v-else-if="!pending && contentData" class="text-center text-orange-500 py-10">
      Tipo de contenido '{{ contentData.type }}' no reconocido.
    </div>

    <!-- Error -->
    <div v-else-if="error && !pending" class="text-center py-10 text-red-500">
      <p>Error cargando datos. Inténtalo de nuevo más tarde.</p>
      <p class="mt-2 text-sm">{{ error.message }}</p>
    </div>
  </div>
</template>
