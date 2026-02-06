<script setup lang="ts">
import { computed } from "vue"
import { NuxtImg } from "#components"

type ImageDto = { src: string; alt?: string; width?: number; height?: number } | null

const props = defineProps<{
  title: string
  href: string
  image?: ImageDto
}>()

const fallback = "/img/placeholders/mockup.webp"

const img = computed(() => ({
  src: props.image?.src || fallback,
  alt: props.image?.alt || props.title,
  width: props.image?.width || 252,
  height: props.image?.height || 231,
}))
</script>

<template>
  <NuxtLink :to="href" class="group block w-full">
    <div class="relative h-[231px] w-full overflow-hidden rounded-[12px] bg-black/10 ring-1 ring-black/5">
      <NuxtImg
        :src="img.src"
        :alt="img.alt"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        sizes="(max-width: 768px) 50vw, 252px"
        width="252"
        height="231"
        loading="lazy"
        decoding="async"
        format="webp"
      />
      <div class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/5" />
    </div>

    <div class="mt-2 pb-2 text-center text-[17px] leading-[24px] font-normal text-[#212121]">
      {{ title }}
    </div>
  </NuxtLink>
</template>
