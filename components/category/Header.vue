<script setup lang="ts">
import { computed } from "vue";
import { SIZES_PRESET } from "@/utils/images";

const props = withDefaults(
  defineProps<{
    title: string;
    image?: string | { src?: string; width?: number; height?: number };
    alt?: string;
    /** Prefijo para rutas relativas (p.ej. '/img/categorias') */
    imageBase?: string;
    /** Controla placeholder por defecto */
    kind?: "category" | "product";
  }>(),
  {
    alt: "",
    imageBase: "",
    kind: "category",
  }
);

const FALLBACKS = {
  category: "/img/placeholders/categoria.webp",
  product: "/img/placeholders/productos.webp",
};

const hero = computed(() => {
  const raw = props.image || FALLBACKS[props.kind || "category"];

  let src = typeof raw === "string" ? raw : raw?.src || "";
  if (props.imageBase && src && !/^https?:\/\//.test(src) && !src.startsWith("/")) {
    src = `${props.imageBase.replace(/\/+$/, "")}/${src.replace(/^\/+/, "")}`;
  }
  if (!src) src = FALLBACKS[props.kind || "category"];

  const width = typeof raw === "object" && raw?.width ? raw.width : 1200;
  const height = typeof raw === "object" && raw?.height ? raw.height : 800;
  const alt = props.alt || props.title;

  return { src, width, height, alt };
});
</script>

<template>
  <header class="relative">
    <NuxtImg
      :src="hero.src"
      :alt="hero.alt"
      :width="hero.width"
      :height="hero.height"
      :sizes="SIZES_PRESET"
      format="webp"
      loading="lazy"
      class="w-full h-auto object-cover"
    />
    <div class="max-w-7xl mx-auto px-6 py-8">
      <h1 class="text-3xl font-semibold">{{ title }}</h1>
      <div class="mt-2">
        <slot />
      </div>
    </div>
  </header>
</template>
