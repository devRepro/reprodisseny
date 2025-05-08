<script setup lang="ts">
import { NuxtImg, NuxtLink } from '#components'

// Props for image, title, description and CTA
const props = withDefaults(defineProps<{
  image: string
  alt?: string
  title: string
  description?: string
  ctaText?: string
  ctaLink?: string
}>(), {
  alt: '',
  description: '',
  ctaText: 'Descubre más ventajas',
  ctaLink: '#'
})
</script>

<template>
  <section class="flex flex-col md:flex-row items-start bg-white px-6 pt-4 pb-6 md:px-12 md:pt-6 md:pb-12">
    <!-- Imagen a la izquierda -->
    <div class="w-full md:w-1/2">
      <NuxtImg
        :src="props.image"
        :alt="props.alt || props.title"
        class="w-full h-auto object-cover rounded-lg shadow-md"
        loading="lazy"
        format="webp"
        quality="80"
      />
    </div>
    <!-- Texto a la derecha -->
    <div class="w-full md:w-1/2 mt-4 md:mt-0 md:pl-8 text-center md:text-left">
      <h1 class="text-3xl md:text-5xl font-bold text-gray-800">{{ props.title }}</h1>
      <p v-if="props.description" class="mt-4 text-lg text-gray-600">{{ props.description }}</p>
      <NuxtLink
        :to="props.ctaLink"
        class="mt-6 inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition"
      >
        {{ props.ctaText }}
      </NuxtLink>
    </div>
  </section>
</template>

