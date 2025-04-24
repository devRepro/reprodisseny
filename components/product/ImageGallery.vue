<template>
    <div class="flex flex-col gap-4">
      <div class="flex gap-2 overflow-x-auto">
        <img
          v-for="(img, i) in images"
          :key="i"
          :src="img"
          @click="current = img"
          class="h-16 w-16 rounded-md border object-cover cursor-pointer"
          :class="{ 'ring-2 ring-primary': current === img }"
        />
      </div>
      <img :src="current" class="w-full max-h-[500px] object-contain rounded-lg border" />
    </div>
  </template>
  
  <script setup>
  const props = defineProps({ images: Array })
  const current = ref(props.images?.[0])
  </script>
  