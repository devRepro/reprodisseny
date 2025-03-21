<template>
    <UCard class="hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden group">
      <NuxtLink :to="link" aria-label="Ver detalle" class="block">
        <img
          :src="image"
          :alt="title"
          class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div class="p-4 text-center">
          <h3 class="text-lg font-semibold text-gray-800 hover:text-primary transition-colors">
            {{ title }}
          </h3>
        </div>
      </NuxtLink>
    </UCard>
  </template>
  
  <script setup>
  defineProps({
    title: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, required: true }
  });
  </script>
  