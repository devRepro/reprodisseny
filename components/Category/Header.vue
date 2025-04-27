<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

defineProps<{
  title: string
  description?: string
  image?: string
  alt?: string
  cta?: { label: string; link: string }
  link?: string
}>()

function getCategoryImageUrl(image?: string): string {
  const defaultImage = '/img/placeholder.webp'
  if (!image || image.trim() === '') return defaultImage
  return image.startsWith('/') ? image : `/img/categorias/${image}`
}
</script>

<template>
  <section aria-labelledby="category-header-title" class="bg-background py-10 md:py-20">
    <div class="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center px-4">
      
      <!-- Texto -->
      <div class="md:col-span-7">
        <h1 id="category-header-title" class="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6 text-foreground">
          {{ title }}
        </h1>
        <p v-if="description" class="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
          {{ description }}
        </p>
        <div class="flex flex-wrap gap-4">
          <Button v-if="cta" :as="NuxtLink" :to="cta.link" variant="default">
            {{ cta.label }}
          </Button>
          <Button v-if="link" :as="NuxtLink" :to="link" variant="outline">
            Saber más
          </Button>
        </div>
      </div>

      <!-- Imagen -->
      <div v-if="image" class="md:col-span-5 hidden md:block">
        <Card class="overflow-hidden rounded-2xl shadow-lg">
          <CardHeader class="p-0">
            <NuxtImg
              :src="getCategoryImageUrl(image)"
              :alt="alt || title"
              class="w-full h-auto object-cover transition-transform duration-300 ease-in-out hover:scale-105"
              width="600"
              height="400"
              format="webp"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              placeholder
              loading="lazy"
            />
          </CardHeader>
        </Card>
      </div>

    </div>
  </section>
</template>
