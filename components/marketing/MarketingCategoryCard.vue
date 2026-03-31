<script setup lang="ts">
import CatalogCard from "@/components/shared/catalog/CatalogCard.vue";

type ImageDto =
  | {
      src?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | null;

const props = withDefaults(
  defineProps<{
    title: string;
    href: string;
    image?: ImageDto;
    description?: string | null;
    ctaText?: string;
  }>(),
  {
    image: null,
    description: "",
    ctaText: "Ver categoría",
  }
);
</script>

<template>
  <CatalogCard
    :href="props.href"
    :title="props.title"
    :description="props.description"
    :image="props.image"
    :cta-label="props.ctaText"
    fallback-label="Categoría"
  />
</template>