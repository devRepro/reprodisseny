<script setup lang="ts">
import { computed } from "vue";
import ProductHeroGallery from "@/components/marketing/product/ProductHeroGallery.vue";
import ProductAttributePills from "@/components/shared/pills/ProductAttributePills.vue";
import LeadForm from "@/components/marketing/product/LeadForm.vue";

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

const FALLBACK = "/img/placeholders/producto.webp";

const productTitle = computed(() => props.product?.title?.trim() || "");

const productDesc = computed(() => {
  return (
    props.product?.shortDescription?.trim() ||
    props.product?.description?.trim() ||
    ""
  );
});

const productAriaLabel = computed(() =>
  productTitle.value
    ? `Página del producto ${productTitle.value}`
    : "Página de producto",
);

const imgAlt = computed(() => {
  const image = props.product?.image;

  if (image && typeof image === "object" && image.alt) {
    return image.alt;
  }

  return productTitle.value || "Producto";
});

const attributePills = computed<HeroProductAttribute[]>(() => {
  const raw = Array.isArray(props.product?.attributes) ? props.product.attributes : [];

  return raw
    .map((item) => ({
      label: String(item?.label || "").trim(),
      icon: item?.icon ? String(item.icon) : null,
      tone: item?.tone ? String(item.tone) : "neutral",
    }))
    .filter((item) => item.label)
    .slice(0, 4);
});

function toHeroImageArray(value: unknown): HeroImage[] {
  return Array.isArray(value) ? (value as HeroImage[]) : [];
}

const primaryImage = computed<HeroImage>(() => {
  return props.product?.imageSrc || props.product?.image || null;
});

const galleryImages = computed<HeroImage[]>(() => [
  ...toHeroImageArray(props.product?.gallery),
  ...toHeroImageArray(props.product?.galleryImages),
  ...toHeroImageArray(props.product?.images),
]);

const categorySlug = computed(() => {
  return props.category?.slug || props.product?.categorySlug || "";
});

const extraFields = computed(() => {
  const explicitExtraFields = Array.isArray(props.product?.extraFields)
    ? props.product.extraFields
    : [];

  if (explicitExtraFields.length) return explicitExtraFields;

  return Array.isArray(props.product?.formFields) ? props.product.formFields : [];
});

const productNameForForm = computed(() => productTitle.value || "Producto");
</script>

<template>
  <article
    class="product-hero"
    itemscope
    itemtype="https://schema.org/Product"
    :aria-label="productAriaLabel"
  >
    <meta v-if="product?.sku" itemprop="sku" :content="String(product.sku)" />
    <meta v-if="productTitle" itemprop="name" :content="productTitle" />
    <meta v-if="productDesc" itemprop="description" :content="productDesc" />

    <div class="product-hero__grid">
      <section class="product-hero__main">
        <div class="product-hero__content">
          <header class="product-hero__header">
            <p v-if="category?.title || category?.nav" class="product-hero__category-pill">
              {{ category?.nav || category?.title }}
            </p>

            <h1 class="product-hero__title" :title="productTitle" itemprop="name">
              {{ productTitle }}
            </h1>

            <p v-if="productDesc" class="product-hero__description" itemprop="description">
              {{ productDesc }}
            </p>
          </header>

          <ProductHeroGallery
            class="product-hero__gallery"
            :primary-image="primaryImage"
            :images="galleryImages"
            :alt="imgAlt"
            :fallback="FALLBACK"
          />

          <ProductAttributePills v-if="attributePills.length" :items="attributePills" />
        </div>
      </section>

      <aside class="product-hero__aside">
        <div class="product-lead-card">
          <LeadForm
            :producto="productNameForForm"
            :category-slug="categorySlug"
            :extra-fields="extraFields"
            :product-data="product"
            class="w-full xl:min-h-0 xl:flex-1"
          />
        </div>
      </aside>
    </div>
  </article>
</template>
