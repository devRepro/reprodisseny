<script setup lang="ts">
import { computed } from "vue";
import CatalogCard from "@/components/shared/catalog/CatalogCard.vue";

type ProductImage =
  | string
  | {
      src?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | null
  | undefined;

type ProductItem = {
  slug?: string | null;
  path?: string | null;
  title?: string | null;
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  excerpt?: string | null;
  image?: ProductImage;
  imageSrc?: string | null;
};

const props = withDefaults(
  defineProps<{
    product: ProductItem;
    ctaLabel?: string;
  }>(),
  {
    ctaLabel: "Ver producto",
  }
);

const title = computed(() => props.product?.title || props.product?.name || "");

const href = computed(() => {
  if (props.product?.path) return props.product.path;
  if (props.product?.slug) return `/productos/${props.product.slug}`;
  return "#";
});

const description = computed(
  () =>
    props.product?.shortDescription ||
    props.product?.excerpt ||
    props.product?.description ||
    ""
);

const image = computed(() => {
  if (props.product?.image) return props.product.image;
  if (props.product?.imageSrc) {
    return {
      src: props.product.imageSrc,
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
    fallback-label="Producto"
  />
</template>