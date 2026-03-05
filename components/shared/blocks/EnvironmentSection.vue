<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    title: string
    items?: string[]
    itemsLeft?: string[]
    itemsRight?: string[]
    backgroundSrc?: string
    overlayOpacity?: number
  }>(),
  {
    items: () => [],
    itemsLeft: undefined,
    itemsRight: undefined,
    backgroundSrc: "/img/ui/bggreen_1920.webp",
    overlayOpacity: 0.55,
  }
)

const leftItems = computed(() => {
  if (props.itemsLeft?.length) return props.itemsLeft
  const half = Math.ceil((props.items?.length || 0) / 2)
  return (props.items || []).slice(0, half)
})

const rightItems = computed(() => {
  if (props.itemsRight?.length) return props.itemsRight
  const half = Math.ceil((props.items?.length || 0) / 2)
  return (props.items || []).slice(half)
})

const overlayStyle = computed(() => ({
  backgroundColor: `rgba(3, 65, 55, ${props.overlayOpacity})`,
}))
</script>

<template>
  <section class="relative isolate w-full overflow-hidden">
    <!-- Background image (sin IPX) -->
    <img
      :src="backgroundSrc"
      alt=""
      aria-hidden="true"
      class="absolute inset-0 -z-20 h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />

    <!-- Overlay -->
    <div class="absolute inset-0 -z-10" :style="overlayStyle" />
    <div class="absolute inset-0 -z-10 bg-black/10" />

    <!-- Content -->
    <div class="mx-auto max-w-[980px] px-6 py-16 md:py-24">
      <h2 class="text-center font-['Figtree'] text-3xl md:text-4xl font-semibold text-white">
        {{ title }}
      </h2>

      <div class="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <ul class="space-y-6">
          <li v-for="(t, i) in leftItems" :key="`l-${i}`" class="flex gap-4">
            <span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-white/90" aria-hidden="true" />
            <p class="font-['Inter'] text-lg md:text-xl font-semibold text-white/95 leading-snug">
              {{ t }}
            </p>
          </li>
        </ul>

        <ul class="space-y-6">
          <li v-for="(t, i) in rightItems" :key="`r-${i}`" class="flex gap-4">
            <span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-white/90" aria-hidden="true" />
            <p class="font-['Inter'] text-lg md:text-xl font-semibold text-white/95 leading-snug">
              {{ t }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>