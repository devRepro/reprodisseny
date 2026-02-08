<script setup lang="ts">
defineProps<{
  items: Array<{ slug: string; path: string; title: string; image?: any }>;
}>();
</script>

<template>
  <div class="w-[1000px] flex justify-between">
    <NuxtLink
      v-for="p in items"
      :key="p.slug"
      :to="p.path"
      class="w-[220px] flex flex-col items-center gap-4"
    >
      <div class="w-[220px] h-[220px] rounded-[120px] overflow-hidden">
        <NuxtImg
          v-if="p.image?.src"
          :src="p.image.src"
          :alt="p.image.alt || p.title"
          class="w-full h-full object-cover"
          sizes="220px"
          densities="x1 x2"
        />
        <div v-else class="w-full h-full bg-[#EFEFEF]" />
      </div>

      <p class="text-[17px] leading-[23.8px] text-center text-[#212121]">
        {{ p.title }}
      </p>
    </NuxtLink>
  </div>
</template>
