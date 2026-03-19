<script setup lang="ts">
import { computed } from "vue";
import CategoryHeader from "@/components/category/Header.vue";

const props = withDefaults(
  defineProps<{
    image?: string | { src?: string; width?: number; height?: number };
    alt?: string;
    title: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    /** "categorias" | "productos" | base path personalizado */
    imageBase?: "categorias" | "productos" | string;
  }>(),
  {
    alt: "",
    description: "",
    ctaText: "Descubre más ventajas",
    ctaLink: "#",
    imageBase: "categorias",
  }
);

const resolvedBase = computed(() =>
  props.imageBase === "categorias"
    ? "/img/categorias"
    : props.imageBase === "productos"
    ? "/img/productos"
    : props.imageBase || ""
);

const kind = computed<"category" | "product">(() =>
  props.imageBase === "productos" ? "product" : "category"
);
</script>

<template>
  <CategoryHeader
    :image="props.image"
    :alt="props.alt || props.title"
    :title="props.title"
    :image-base="resolvedBase"
    :kind="kind"
  >
    <p v-if="props.description" class="text-lg text-muted-foreground">
      {{ props.description }}
    </p>

    <NuxtLink
      v-if="props.ctaLink"
      :to="props.ctaLink"
      class="inline-block mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition"
    >
      {{ props.ctaText }}
    </NuxtLink>
  </CategoryHeader>
</template>
