<script setup lang="ts">
import { computed } from "vue";

import LeadForm from "@/components/marketing/product/LeadForm.vue";
import ProductHeroGallery from "@/components/marketing/product/ProductHeroGallery.vue";
import ProductAttributePills from "@/components/shared/pills/ProductAttributePills.vue";

type HeroImage =
  | string
  | {
      src?: string | null;
      alt?: string | null;
      caption?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | null
  | undefined;

type HeroProductAttribute = {
  label: string;
  icon?: string | null;
  tone?: string | null;
};

type HeroProduct = {
  slug?: string;
  path?: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  bodyMd?: string;
  imageSrc?: string | null;
  image?: HeroImage;
  gallery?: HeroImage[];
  galleryImages?: HeroImage[];
  images?: HeroImage[];
  attributes?: HeroProductAttribute[];
  formFields?: any[];
  extraFields?: any[];
  categorySlug?: string;
  sku?: string | null;
  seo?: {
    canonical?: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  [key: string]: unknown;
} | null;

type HeroCategory = {
  slug?: string;
  path?: string;
  title?: string;
  nav?: string;
} | null;

const props = defineProps<{
  product: HeroProduct;
  category?: HeroCategory;
}>();

const FALLBACK_IMAGE = "/img/placeholders/producto.webp";
const DEFAULT_PRODUCT_NAME = "Producto";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toHeroImageArray(value: unknown): HeroImage[] {
  return Array.isArray(value) ? (value as HeroImage[]) : [];
}

const productTitle = computed(() => {
  return normalizeText(props.product?.title) || DEFAULT_PRODUCT_NAME;
});

const productDescription = computed(() => {
  return (
    normalizeText(props.product?.shortDescription) ||
    normalizeText(props.product?.description)
  );
});

const categoryLabel = computed(() => {
  return normalizeText(props.category?.nav) || normalizeText(props.category?.title);
});

const categorySlug = computed(() => {
  return (
    normalizeText(props.category?.slug) || normalizeText(props.product?.categorySlug)
  );
});

const productAriaLabel = computed(() => {
  return `Página del producto ${productTitle.value}`;
});

const imageAlt = computed(() => {
  const image = props.product?.image;

  if (image && typeof image === "object") {
    const explicitAlt = normalizeText(image.alt);

    if (explicitAlt) {
      return explicitAlt;
    }
  }

  return productTitle.value;
});

const primaryImage = computed<HeroImage>(() => {
  return props.product?.imageSrc || props.product?.image || null;
});

const galleryImages = computed<HeroImage[]>(() => {
  return [
    ...toHeroImageArray(props.product?.gallery),
    ...toHeroImageArray(props.product?.galleryImages),
    ...toHeroImageArray(props.product?.images),
  ];
});

const attributePills = computed<HeroProductAttribute[]>(() => {
  const attributes = Array.isArray(props.product?.attributes)
    ? props.product.attributes
    : [];

  return attributes
    .map((attribute) => ({
      label: normalizeText(attribute?.label),
      icon: normalizeText(attribute?.icon) || null,
      tone: normalizeText(attribute?.tone) || "neutral",
    }))
    .filter((attribute) => Boolean(attribute.label))
    .slice(0, 4);
});

const extraFields = computed(() => {
  const explicitExtraFields = Array.isArray(props.product?.extraFields)
    ? props.product.extraFields
    : [];

  if (explicitExtraFields.length > 0) {
    return explicitExtraFields;
  }

  return Array.isArray(props.product?.formFields) ? props.product.formFields : [];
});
</script>

<template>
  <article class="product-hero" :aria-label="productAriaLabel">
    <header class="product-hero__header">
      <p v-if="categoryLabel" class="product-hero__category-pill">
        {{ categoryLabel }}
      </p>

      <h1 class="product-hero__title" :title="productTitle">
        {{ productTitle }}
      </h1>

      <p v-if="productDescription" class="product-hero__description">
        {{ productDescription }}
      </p>
    </header>

    <div class="product-hero__grid">
      <section class="product-hero__main" aria-label="Galería del producto">
        <ProductHeroGallery
          class="product-hero__gallery"
          :primary-image="primaryImage"
          :images="galleryImages"
          :alt="imageAlt"
          :fallback="FALLBACK_IMAGE"
        />
      </section>

      <div v-if="attributePills.length" class="product-hero__attributes">
        <ProductAttributePills :items="attributePills" />
      </div>

      <aside class="product-hero__aside" aria-label="Solicitud de presupuesto">
        <div class="product-lead-card">
          <LeadForm
            :producto="productTitle"
            :category-slug="categorySlug"
            :extra-fields="extraFields"
            :product-data="props.product"
            class="h-full min-h-0 w-full flex-1"
          />
        </div>
      </aside>
    </div>
  </article>
</template>
