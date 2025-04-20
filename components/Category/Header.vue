<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { NuxtImg } from '#components'

const props = defineProps<{
  title?: string
  description?: string
  link?: string
  image?: string
  alt?: string
}>()
</script>

<template>
  <section
    aria-labelledby="category-hero-title"
    class="bg-white dark:bg-gray-900 py-8 md:py-16"
  >
    <div class="mx-auto max-w-screen-xl px-4 grid grid-cols-1 md:grid-cols-12 gap-6">
      <div v-if="pending" class="text-center py-12">Cargando…</div>
    <div v-else-if="error" class="text-center text-red-600 py-12">Error al cargar la categoría.</div>
    <div v-else-if="categoria">
      <CategoryHeader
        :title="categoria.value.titulo"
        :description="categoria.value.descripcion"
        :link="`/contacto?from=${categoria.value.slug}`"
        :image="categoria.value.imagen"
        :alt="categoria.value.titulo"
      />
    </div>

      <!-- Imagen -->
      <div v-if="props.image" class="md:col-span-5 flex items-center">
        <NuxtImg
          :src="props.image"
          :alt="props.alt || props.title"
          class="w-full h-auto rounded-lg shadow-lg object-cover"
          lazy
        />
      </div>
    </div>
  </section>
</template>
