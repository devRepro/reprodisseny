<script setup lang="ts">
import { computed } from "vue";
import CatalogCard from "@/components/shared/catalog/CatalogCard.vue";

type CategoryImage =
  | string
  | {
      src?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | null
  | undefined;

type CategoryItem = {
  slug?: string | null;
  path?: string | null;
  title?: string | null;
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  excerpt?: string | null;
  image?: CategoryImage;
  imageSrc?: string | null;
  hero?: {
    image?: CategoryImage;
  } | null;
};

const props = withDefaults(
  defineProps<{
    category: CategoryItem;
    ctaLabel?: string;
  }>(),
  {
    ctaLabel: "Ver categoría",
  }
);

const title = computed(
  () => props.category?.title || props.category?.name || ""
);

const href = computed(() => {
  if (props.category?.path) return props.category.path;
  if (props.category?.slug) return `/categorias/${props.category.slug}`;
  return "#";
});

const description = computed(
  () =>
    props.category?.shortDescription ||
    props.category?.excerpt ||
    props.category?.description ||
    ""
);

const image = computed(() => {
  if (props.category?.image) return props.category.image;
  if (props.category?.hero?.image) return props.category.hero.image;
  if (props.category?.imageSrc) {
    return {
      src: props.category.imageSrc,
      alt: title.value,
    };
  }
  return null;
});
</script>

<template>
  <CatalogCard
    :href="href"
    :title="title"
    :description="description"
    :image="image"
    :cta-label="ctaLabel"
    fallback-label="Categoría"
  />
</template>