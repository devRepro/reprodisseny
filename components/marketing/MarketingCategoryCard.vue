<script setup lang="ts">
import { computed } from "vue"
import { Button } from "@/components/ui/button"

type ImageDto = { src: string; alt?: string } | null

const props = withDefaults(
  defineProps<{ title: string; href: string; image?: ImageDto; ctaText?: string }>(),
  { image: null, ctaText: "Ver categoría" }
)

const src = computed(() => String(props.image?.src || "").trim())
const isRemote = computed(() => /^https?:\/\//i.test(src.value))
const alt = computed(() => props.image?.alt || props.title)

// importante: reduce padding (p-0 o p-2) para que no se vea pequeña
const imgClass = "absolute inset-0 h-full w-full object-cover p-1 object-center"
</script>

<template>
  <article class="flex flex-col items-center text-center w-[252px]">
    <NuxtLink :to="href" class="block w-full">
      <div class="overflow-hidden rounded-2xl bg-brand-bg-2">
        <!-- caja exacta del diseño -->
        <div class="relative w-[252px] h-[231px]">
          <img
            v-if="isRemote && src"
            :src="src"
            :alt="alt"
            :class="imgClass"
            loading="lazy"
            decoding="async"
            width="252"
            height="231"
          />

          <NuxtImg
            v-else-if="src"
            :src="src"
            :alt="alt"
            :class="imgClass"
            loading="lazy"
            :width="252"
            :height="231"
          />
        </div>
      </div>
    </NuxtLink>

    <!-- en Figma esto suele ir más pegado -->
    <NuxtLink :to="href" class="mt-3 block">
      <h3 class="text-sm font-medium text-brand-ink-medium">{{ title }}</h3>
    </NuxtLink>

    <!-- botón más “figma”: más bajito -->
    <Button as-child class="mt-2 h-8 rounded-full px-4 text-xs">
      <NuxtLink :to="href">{{ ctaText }}</NuxtLink>
    </Button>
  </article>
</template>