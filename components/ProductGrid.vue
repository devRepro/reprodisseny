<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps<{
  category: string
}>()

const { data: productos } = await useAsyncData(() => {
  return queryCollection('categorias')
    .where('type', '=', 'producto')
    .where('category', '=', props.category)
    .select('title', 'slug', 'path', 'description', 'image', 'alt')
    .all()
})
</script>

<template>
  <section class="container mx-auto px-4 py-10">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-6">
      Productos de la categoría "{{ category }}"
    </h2>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="product in productos"
        :key="product.path"
        class="group flex flex-col bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 h-full overflow-hidden"
      >
        <div class="p-4 text-center">
          <h5 class="font-semibold text-lg">{{ product.title }}</h5>
          <p class="text-sm text-gray-600">{{ product.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
