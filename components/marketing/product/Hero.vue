<script setup lang="ts">
import { computed, watchEffect } from "vue";
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


const imgAlt = computed(() => {
  const image = props.product?.image;

  if (typeof image === "object" && image?.alt) {
    return image.alt;
  }

  return props.product?.title || "Producto";
});

const productTitle = computed(() => props.product?.title?.trim() || "");

const productDesc = computed(() => {
  return (
    props.product?.shortDescription?.trim() || props.product?.description?.trim() || ""
  );
});


const attributePills = computed<HeroProductAttribute[]>(() => {
  const raw = Array.isArray(props.product?.attributes)
    ? props.product.attributes
    : [];

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

const galleryImages = computed<HeroImage[]>(() => {
  return [
    ...toHeroImageArray(props.product?.gallery),
    ...toHeroImageArray(props.product?.galleryImages),
    ...toHeroImageArray(props.product?.images),
  ];
});

const categorySlug = computed(() => {
  return props.category?.slug || props.product?.categorySlug || "";
});

const extraFields = computed(() => {
  const explicitExtraFields = Array.isArray(props.product?.extraFields)
    ? props.product?.extraFields
    : [];

  if (explicitExtraFields.length) {
    return explicitExtraFields;
  }

  return Array.isArray(props.product?.formFields) ? props.product?.formFields : [];
});


const productNameForForm = computed(() => productTitle.value || "Producto");

watchEffect(() => {
  if (!import.meta.dev) return;

  console.log("[ProductHeroGallery input]", {
  productTitle: productTitle.value,
  productKeys: Object.keys(props.product ?? {}),
  attributes: props.product?.attributes,
  primaryImage: primaryImage.value,
  gallery: props.product?.gallery,
  galleryImages: props.product?.galleryImages,
  images: props.product?.images,
  computedGalleryImages: galleryImages.value,
});
});
</script>

<template>
  <article class="w-full" itemscope itemtype="https://schema.org/Product" :aria-label="productTitle ? `Página del producto ${productTitle}` : 'Página de producto'
    ">
    <meta v-if="product?.sku" itemprop="sku" :content="String(product.sku)" />
    <meta v-if="productTitle" itemprop="name" :content="productTitle" />
    <meta v-if="productDesc" itemprop="description" :content="productDesc" />

    <div
      class="grid items-start gap-8 lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(380px,430px)] xl:gap-12 2xl:grid-cols-[minmax(0,1fr)_minmax(400px,450px)]">
      <section class="min-w-0">
        <div class="max-w-3xl">
          <header class="space-y-4 md:space-y-5">
            <p v-if="category?.title || category?.nav"
              class="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-label text-primary">
              {{ category?.nav || category?.title }}
            </p>

            <h1
              class="text-[clamp(2.1rem,3.6vw,3.9rem)] leading-[1.02] tracking-tight text-foreground [overflow-wrap:anywhere]"
              :title="productTitle" itemprop="name">
              {{ productTitle }}
            </h1>

            <p v-if="productDesc" class="max-w-[68ch] text-body text-foreground/78 md:text-[18px] md:leading-[1.68]"
              itemprop="description">
              {{ productDesc }}
            </p>
          </header>

          <ProductHeroGallery class="mt-6 md:mt-8" :primary-image="primaryImage" :images="galleryImages" :alt="imgAlt"
            :fallback="FALLBACK" />

          <ProductAttributePills v-if="attributePills.length" :items="attributePills" />
        </div>
      </section>

      <aside class="min-w-0 xl:sticky xl:top-24 xl:self-start">
        <div class="product-lead-card">
          <LeadForm :producto="productNameForForm" :category-slug="categorySlug" :extra-fields="extraFields"
            :product-data="product" class="w-full xl:min-h-0 xl:flex-1" />
        </div>
      </aside>
    </div>
  </article>
</template>
