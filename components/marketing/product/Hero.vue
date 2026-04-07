<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
import LeadForm from "@/components/marketing/product/LeadForm.vue";

type HeroImage =
  | string
  | {
      src?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | null
  | undefined;

type HeroProduct = {
  slug?: string;
  path?: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  bodyMd?: string;
  imageSrc?: string | null;
  image?: HeroImage;
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

const supportItems = [
  "Asesoramiento técnico",
  "Revisión básica de archivo",
  "Respuesta rápida",
];

const rawImageSrc = computed(() => {
  return (
    props.product?.imageSrc ||
    (typeof props.product?.image === "string"
      ? props.product.image
      : props.product?.image?.src) ||
    ""
  );
});

const resolvedImgSrc = computed(() => {
  return normalizeCmsMediaSrc(rawImageSrc.value) || FALLBACK;
});

const currentImgSrc = ref(FALLBACK);

watch(
  resolvedImgSrc,
  (value) => {
    currentImgSrc.value = value || FALLBACK;
  },
  { immediate: true }
);

function onImageError() {
  if (currentImgSrc.value !== FALLBACK) {
    currentImgSrc.value = FALLBACK;
  }
}

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

const hasImage = computed(() => Boolean(currentImgSrc.value));
const productNameForForm = computed(() => productTitle.value || "Producto");
</script>

<template>
  <article
    class="w-full rounded-[32px] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--accent)/0.38)_100%)] p-6 md:p-8 xl:p-10"
    itemscope
    itemtype="https://schema.org/Product"
    :aria-label="
      productTitle ? `Página del producto ${productTitle}` : 'Página de producto'
    "
  >
    <meta v-if="product?.sku" itemprop="sku" :content="String(product.sku)" />
    <meta v-if="productTitle" itemprop="name" :content="productTitle" />
    <meta v-if="productDesc" itemprop="description" :content="productDesc" />

    <div
      class="grid items-start gap-8 lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(380px,430px)] xl:gap-12 2xl:grid-cols-[minmax(0,1fr)_minmax(400px,450px)]"
    >
      <section class="min-w-0">
        <div class="max-w-3xl">
          <header class="space-y-4 md:space-y-5">
            <p
              v-if="category?.title || category?.nav"
              class="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-label text-primary"
            >
              {{ category?.nav || category?.title }}
            </p>

            <h1
              class="text-[clamp(2.1rem,3.6vw,3.9rem)] leading-[1.02] tracking-tight text-foreground [overflow-wrap:anywhere]"
              :title="productTitle"
              itemprop="name"
            >
              {{ productTitle }}
            </h1>

            <p
              v-if="productDesc"
              class="max-w-[68ch] text-body text-foreground/78 md:text-[18px] md:leading-[1.68]"
              itemprop="description"
            >
              {{ productDesc }}
            </p>
          </header>

          <figure
            v-if="hasImage"
            class="mt-6 overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.16)] md:mt-8"
          >
            <NuxtImg
              :src="currentImgSrc"
              :alt="imgAlt"
              class="aspect-[16/11] w-full object-cover"
              sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 58vw, 760px"
              width="760"
              height="522"
              densities="x1 x2"
              fetchpriority="high"
              preload
              @error="onImageError"
            />

            <meta itemprop="image" :content="currentImgSrc" />
          </figure>

          <ul class="mt-5 flex flex-wrap gap-2">
            <li
              v-for="item in supportItems"
              :key="item"
              class="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-2 text-body-s text-muted-foreground"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </section>

      <aside class="min-w-0 xl:sticky xl:top-24">
        <div
          class="rounded-[28px] border border-border/70 bg-card px-5 py-5 shadow-[0_14px_36px_-26px_hsl(var(--foreground)/0.16)] md:px-6 md:py-6 xl:px-7 xl:py-7"
        >
          <LeadForm
            :producto="productNameForForm"
            :category-slug="categorySlug"
            :extra-fields="extraFields"
            :product-data="product"
            class="w-full"
          />
        </div>
      </aside>
    </div>
  </article>
</template>
