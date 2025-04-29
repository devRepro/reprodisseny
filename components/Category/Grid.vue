// components/category/Grid.vue
<script setup lang="ts">
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import type { Categoria } from '@/types' // Ajusta la ruta si es necesario

defineProps<{
  categories: Array<{
    title: string
    nav: string
    slug: string
    path: string
    description?: string
    image?: string
    alt?: string
  }>
}>()

function getCategoryImageUrl(image?: string): string {
  const defaultImage = '/img/placeholder.webp';
  if (!image || image.trim() === '') return defaultImage;
  return image.startsWith('/') ? image : `/img/categorias/${image}`;
}
</script>

<template>
  <section aria-labelledby="category-grid-title" class="container mx-auto px-4 py-10">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <NuxtLink
        v-for="category in categories"
        :key="category.path || category.slug"
        :to="category.path || `/categorias/${category.slug}`"
        class="group block rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        :aria-label="`Ver categoría ${category.nav || category.title}`"
      >
        <Card class="h-full overflow-hidden transition-shadow hover:shadow-lg flex flex-col">
          <CardHeader class="p-0 border-b overflow-hidden">
             <div class="aspect-[3/2] overflow-hidden">
              <NuxtImg
                :src="getCategoryImageUrl(category.image)"
                :alt="category.alt || category.title || 'Imagen de categoría'"
                class="w-full h-full object-cover object-center transition-transform duration-300 ease-in-out group-hover:scale-105"
                width="400"
                height="267"
                format="webp"
                placeholder
                loading="lazy"
              /> {/* <-- El comentario ha sido eliminado */}
             </div>
          </CardHeader>
          <CardContent class="p-4 flex-grow flex items-center justify-center">
            <CardTitle class="text-lg md:text-base text-center font-semibold text-gray-900 dark:text-white transition-colors duration-200 group-hover:text-[hsl(var(--color-primary))]">
              {{ category.nav || category.title }}
            </CardTitle>
          </CardContent>
        </Card>
      </NuxtLink>
    </div>
  </section>
</template>