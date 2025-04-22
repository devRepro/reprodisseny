<template>
  <section aria-labelledby="products-title" class="bg-gray-50 dark:bg-gray-950 py-16">
    <div class="max-w-screen-xl mx-auto px-4 space-y-10">
      <h2 id="products-title" class="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
        Explora nuestros productos
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <Card
          v-for="item in items"
          :key="item.slug"
          class="group relative flex flex-col overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <CardHeader class="p-0 overflow-hidden">
            <NuxtImg
              :src="getImage(item.image)"
              :alt="item.alt || item.title"
              class="w-full aspect-[3/2] object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              width="600"
              height="400"
              format="webp"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              placeholder
            />
          </CardHeader>

          <CardContent class="flex flex-col justify-between h-full p-5 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
              {{ item.title }}
            </h3>

            <Button
              size="sm"
              variant="outline"
              class="inline-flex items-center gap-2 text-primary-700 dark:text-primary-300 hover:underline"
              :to="item._path || `/productos/${item.slug}`"
            >
              Más información
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-primary-700 dark:text-primary-300 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>


<script setup lang="ts">
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Product {
  title: string
  slug: string
  description: string
  image: string
  alt?: string
  _path?: string
}

defineProps<{ items: Product[] }>()

function getImage(image?: string): string {
  return image && image.trim() !== ''
    ? image.startsWith('/')
      ? image
      : `/img/productos/${image}`
    : '/img/productos/mockupProduct.webp'
}
</script>
