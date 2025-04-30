<template>
    <div class="product-card">
      <NuxtLink :to="link" class="block group" aria-label="Ir a {{ title }}">
        <NuxtImg
          :src="image"
          :alt="title"
          width="400"
          height="320"
          format="webp"
          class="rounded-md w-full h-auto object-cover group-hover:scale-[1.02] transition"
          loading="lazy"
        />
        <div class="mt-3 text-center">
          <h3 class="text-base font-medium text-foreground group-hover:text-primary transition">
            {{ title }}
          </h3>
        </div>
      </NuxtLink>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    title: string
    link: string
    image: string
  }>()
  </script>
  
  <style scoped>
  .product-card {
    display: flex;
    flex-direction: column;
  }
  </style>
  