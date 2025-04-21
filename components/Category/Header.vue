<!-- components/category/Header.vue -->
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { NuxtImg } from '#components'

const props = defineProps<{
  title: string
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
      <!-- Texto -->
      <div class="md:col-span-7 flex flex-col justify-center">
        <h1
          id="category-hero-title"
          class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4"
        >
          {{ props.title }}
        </h1>
        <p
          v-if="props.description"
          class="text-gray-600 dark:text-gray-400 md:text-lg lg:text-xl mb-6"
        >
          {{ props.description }}
        </p>
        <Button
          v-if="props.link"
          as="nuxt-link"
          :to="props.link"
          variant="primary"
          size="lg"
        >
          Saber más
        </Button>
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
