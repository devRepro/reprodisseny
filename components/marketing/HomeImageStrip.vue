<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div
        v-for="img in images"
        :key="img.src"
        class="overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 bg-white"
      >
        <img :src="img.src" :alt="img.alt" class="h-44 w-full object-cover" loading="lazy" decoding="async" />
      </div>
    </div>

    <p class="mt-6 text-base italic text-sky-900">
      → Si necesitas un <span class="font-semibold">servicio integral</span>, no te preocupes, nosotros nos encargamos de todo el proceso:
      <span class="font-semibold">diseño</span>, <span class="font-semibold">impresión</span>, <span class="font-semibold">instalación</span> y
      <span class="font-semibold">logística</span>.
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  images: { src: string; alt: string }[]
}>()
</script>
