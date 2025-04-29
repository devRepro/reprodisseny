<script setup lang="ts">
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { NuxtLink, NuxtImg } from '#components'

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

function resolveImageUrl(src?: string): string {
  if (!src) return '/img/placeholder.webp'
  return src.startsWith('/') || src.startsWith('http') ? src : `/img/categorias/${src}`
}
</script>

<!-- components/category/Carrousel.vue -->
<template>
  <section class="container mx-auto px-4 py-10">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <!-- Iterar sobre las categorías -->
      <template v-for="c in props.categories">
        <!-- SÓLO renderizar si 'c' no es null/undefined -->
        <div v-if="c" :key="c.path || c.slug">
          <NuxtLink
            :to="c.path || `/categorias/${c.slug}`"
            class="group block rounded-xl overflow-hidden hover:shadow-lg transition"
          >
            <Card class="h-full flex flex-col">
              <CardHeader class="p-0 border-b">
                <div class="relative w-full h-48 overflow-hidden">
                  <NuxtImg
                    :src="resolveImageUrl(c.image)"
                    :alt="c.alt || c.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy" 
                    format="webp" 
                    quality="80" 
                  />
                  <NuxtImg
                    v-if="c.hoverImage"
                    :src="resolveImageUrl(c.hoverImage)"
                    :alt="c.alt || c.title"
                    class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                    format="webp"
                    quality="80"
                  />
                </div>
              </CardHeader>
              <CardContent class="p-4 flex flex-col flex-grow">
                <CardTitle class="text-lg font-semibold text-center">
                  {{ c.nav || c.title }}
                </CardTitle>
                <p v-if="c.description" class="mt-2 text-sm text-gray-600 text-center">
                  {{ c.description }}
                </p>
                <div v-if="c.price" class="mt-3 text-center">
                  <span class="font-semibold text-gray-900">{{ c.price }}</span>
                </div>
              </CardContent>
            </Card>
          </NuxtLink>
        </div>
      </template>
    </div>
  </section>
</template>
