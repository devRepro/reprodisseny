// components/category/Grid.vue
<script setup lang="ts">
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card'
import type { Categoria } from '@/types'

defineProps<{ categories: Categoria[] }>()

function getCategoryImageUrl(image?: string): string {
  const defaultImage = '/img/categorias/mockupCategoria.webp'
  if (!image || image.trim() === '') return defaultImage
  return image.startsWith('/') ? image : `/img/categorias/${image}`
}
</script>

<template>
  <section
    aria-labelledby="category-grid-title"
    class="container mx-auto px-4 py-10"
  >
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <NuxtLink
        v-for="category in categories"
        :key="category.path || category.slug"
        :to="category.path || `/categorias/${category.slug}`"
        class="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background transition-shadow hover:shadow-lg"
        :aria-label="`Ver categoría ${category.nav || category.title}`"
      >
        <Card
          class="h-full overflow-hidden flex flex-col bg-white dark:bg-muted border border-border shadow-sm"
        >
          <CardHeader class="p-0 border-b">
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
              />
            </div>
          </CardHeader>

          <CardContent class="p-4 flex-grow flex items-center justify-center">
            <CardTitle
              class="text-lg md:text-base text-center font-semibold text-foreground group-hover:text-primary transition-colors duration-200"
            >
              {{ category.nav || category.title }}
            </CardTitle>
          </CardContent>
        </Card>
      </NuxtLink>
    </div>
  </section>
</template>
