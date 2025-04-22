<template>
  <section aria-labelledby="products-title" class="space-y-6">
    <h2 id="products-title" class="text-2xl font-semibold">Nuestros productos</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="item in items" :key="item.slug" class="hover:shadow-lg transition">
        <CardHeader>
          <NuxtImg
            :src="item.image.startsWith('http') ? item.image : `/img/productos/${item.image}`"
            :alt="item.alt || item.title"
            class="w-full h-48 object-cover rounded-t-lg"
            lazy
          />
        </CardHeader>
        <CardContent class="p-4 space-y-2">
          <h3 class="font-semibold text-lg">{{ item.title }}</h3>
          <p class="text-sm text-gray-600">{{ item.description }}</p>
          <Button size="sm" variant="ghost" @click="$emit('view', item.slug)">
            Más información →
          </Button>
        </CardContent>
      </Card>
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
}

defineProps<{ items: Product[] }>()
</script>