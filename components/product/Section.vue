<script setup lang="ts">
import type { Producto } from '@/types'

const props = defineProps<{ items: Producto[] }>()

function getImageUrl(src?: string): string {
  const placeholder = '/mockupProduct.webp'
  if (!src || !src.trim()) return placeholder
  return src.startsWith('/') ? src : `/img/productos/${src}`
}
</script>

<template>
  <section aria-labelledby="products-title" class="bg-white py-20">
    <div class="max-w-screen-xl mx-auto px-4">
      <h2 id="products-title" class="text-4xl font-bold text-gray-900 mb-12 text-center">
        Explora nuestros productos
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="item in props.items"
          :key="item.slug"
          class="flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200"
        >
          <!-- Imagen (baja altura) -->
          <div class="w-full h-[200px] bg-gray-100 flex items-center justify-center p-4 bckColorCard">
            <NuxtImg
              :src="getImageUrl(item.image)"
              :alt="item.alt || item.title"
              class="object-contain max-h-full transition-transform duration-300 hover:scale-105"
              width="200"
              height="160"
            />
          </div>

          <!-- Título -->
          <div class="px-4 py-3">
            <NuxtLink :to="item._path || `/productos/${item.slug}`">
              <h3
                class="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline underline-offset-2 text-left transition titleTxt"
              >
                {{ item.title }}
              </h3>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bckColorCard {
  background-color: #f3f4f6;
}

.titleTxt {
    color:#616161;
}
</style>