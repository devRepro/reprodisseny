<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    imageSrc?: string | null
    imageAlt?: string

    title?: string
    description?: string

    to?: string
    ctaLabel?: string
  }>(),
  {
    imageSrc: null,
    imageAlt: "",
    title: "Cómo preparar tus archivos para imprimir",
    description:
      "Guía rápida con tamaños, sangrados, perfiles de color y exportación a PDF para evitar errores y acelerar la producción.",
    to: "/como-preparar-archivos",
    ctaLabel: "Ver la guía de impresión",
  }
)

const bgUrl = computed(() => (props.imageSrc || "").trim() || null)
const hasBg = computed(() => !!bgUrl.value)
</script>

<template>
  <section
    class="relative my-24 overflow-hidden rounded-2xl"
    aria-labelledby="guide-cta-title"
  >
    <!-- Fondo: si hay URL (SharePoint/Azure), úsala; si no, gradiente -->
    <div v-if="hasBg" class="absolute inset-0">
      <img
        :src="bgUrl!"
        :alt="imageAlt"
        class="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div
      v-else
      class="absolute inset-0 bg-gradient-to-br from-muted/70 to-background"
      aria-hidden="true"
    />

    <!-- Overlay para legibilidad -->
    <div class="absolute inset-0 bg-background/80 backdrop-blur-[1px]" />

    <div class="relative mx-auto max-w-7xl px-6 py-16">
      <div class="max-w-2xl">
        <h2
          id="guide-cta-title"
          class="text-3xl font-semibold tracking-tight text-foreground"
        >
          {{ title }}
        </h2>

        <p class="mt-3 text-base leading-relaxed text-muted-foreground">
          {{ description }}
        </p>

        <NuxtLink
          :to="to"
          class="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {{ ctaLabel }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
