<script setup lang="ts">
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { useRouter } from 'vue-router'
import type { VNode } from 'vue'

// Props definition
const props = defineProps<{
  categories: Array<{
    title: string
    nav: string
    slug: string
    path: string
    description?: string
    image?: string
    hoverImage?: string
    alt?: string
    price?: string
  }>
}>()

// Helper to resolve image URL
function resolveImageUrl(src?: string): string {
  const defaultImg = '/img/placeholder.webp'
  if (!src) return defaultImg
  return src.startsWith('http') || src.startsWith('/') ? src : `/img/categorias/${src}`
}

const router = useRouter()

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <section aria-labelledby="category-grid-title" class="container mx-auto px-4 py-10">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="category in props.categories"
        :key="category.path || category.slug"
      >
        <NuxtLink
          :to="category.path || `/categorias/${category.slug}`"
          class="group block rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
          :aria-label="`Ver categoría ${category.nav || category.title}`"
        >
          <Card class="h-full flex flex-col">
            <!-- Header con imagen y hover -->
            <CardHeader class="p-0 border-b overflow-hidden">
              <div class="relative w-full h-48 overflow-hidden">
                <NuxtImg
                  :src="resolveImageUrl(category.image)"
                  :alt="category.alt || category.title || 'Imagen de categoría'"
                  class="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  width="400"
                  height="267"
                />
                <NuxtImg
                  v-if="category.hoverImage"
                  :src="resolveImageUrl(category.hoverImage)"
                  :alt="category.alt || category.title || 'Imagen de categoría'"
                  class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
                  width="400"
                  height="267"
                />
              </div>
            </CardHeader>

            <!-- Contenido: título, descripción, precio -->
            <CardContent class="p-4 flex flex-col flex-grow">
              <CardTitle class="text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 text-center">
                {{ category.nav || category.title }}
              </CardTitle>
              <p
                v-if="category.description"
                class="mt-2 text-sm text-gray-600 text-center"
              >
                {{ category.description }}
              </p>
              <div v-if="category.price" class="mt-3 text-center">
                <span class="text-base font-semibold text-gray-900">
                  {{ category.price }}
                </span>
              </div>
            </CardContent>
          </Card>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
