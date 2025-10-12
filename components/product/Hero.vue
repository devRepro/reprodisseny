<!-- components/product/ProductHero.vue -->
<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    product?: string; // opcional (carpeta del producto)
    src?: string; // opcional (ruta absoluta, ej: /img/categorias/x/header.webp)
    file?: string; // archivo dentro de la carpeta del producto
    description?: string;
    alt?: string;
    labels?: string[];
  }>(),
  {
    file: "header.webp",
    description: "",
    alt: "",
    labels: () => [],
  }
);

const FALLBACK = "/img/placeholders/product.webp";

// Decide la imagen final: src absoluto > carpeta de producto > fallback
const imgSrc = computed(() => {
  if (props.src) return props.src;
  if (props.product) return `/img/productos/${props.product}/${props.file}`;
  return FALLBACK;
});

const imgAlt = computed(() => props.alt || props.title);

function onErr(e: Event) {
  const el = e.target as HTMLImageElement;
  if (el && el.src !== location.origin + FALLBACK) {
    el.src = FALLBACK;
    el.srcset = "";
  }
}
</script>

<template>
  <header class="grid gap-6 md:grid-cols-2 items-start">
    <div>
      <h1 class="text-3xl md:text-4xl font-bold leading-tight">{{ title }}</h1>
      <p v-if="description" class="mt-4 text-muted-foreground text-lg">
        {{ description }}
      </p>

      <div v-if="labels?.length" class="mt-5 flex flex-wrap gap-2">
        <span
          v-for="(chip, i) in labels"
          :key="i"
          class="px-3 py-1 text-sm rounded-full bg-muted text-foreground/80"
        >
          {{ chip }}
        </span>
      </div>
    </div>

    <div class="w-full">
      <NuxtImg
        :src="imgSrc"
        :alt="imgAlt"
        sizes="(max-width: 768px) 100vw, 50vw"
        densities="x1 x2"
        class="w-full h-auto rounded-xl object-cover shadow"
        fetchpriority="high"
        @error="onErr"
      />
    </div>
  </header>
</template>
