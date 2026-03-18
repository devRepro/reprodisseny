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

const resolvedImgSrc = computed(() => {
  const src =
    props.product?.imageSrc ||
    (typeof props.product?.image === "string"
      ? props.product.image
      : props.product?.image?.src);

  const normalized = normalizeCmsMediaSrc(src);
  return normalized || FALLBACK;
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
  if (typeof image === "object" && image?.alt) return image.alt;
  return props.product?.title || "Producto";
});

const extraFields = computed(() => {
  return props.product?.formFields || props.product?.extraFields || [];
});

const categorySlug = computed(() => {
  return props.category?.slug || props.product?.categorySlug || "";
});

const productTitle = computed(() => props.product?.title || "");
</script>

<template>
  <article
    class="w-full"
    itemscope
    itemtype="https://schema.org/Product"
    :aria-label="
      productTitle ? `Página del producto ${productTitle}` : 'Página de producto'
    "
  >
    <div class="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
      <section class="min-w-0 self-start lg:sticky lg:top-24">
        <header class="space-y-4">
          <h1
            class="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
            :title="productTitle"
            itemprop="name"
          >
            {{ productTitle }}
          </h1>
        </header>

        <figure
          class="mt-6 overflow-hidden rounded-2xl border border-border bg-card"
          itemprop="image"
        >
          <NuxtImg
            :src="currentImgSrc"
            :alt="imgAlt"
            class="aspect-[4/3] w-full object-cover sm:aspect-square"
            sizes="sm:100vw lg:560px"
            width="900"
            height="900"
            densities="x1 x2"
            fetchpriority="high"
            preload
            @error="onImageError"
          />
        </figure>

        <p class="mt-3 text-xs text-muted-foreground">
          ¿Dudas con medidas o archivos? Completa el formulario y te orientamos.
        </p>
      </section>

      <aside class="min-w-0">
        <div class="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <LeadForm
            :producto="productTitle"
            :category-slug="categorySlug"
            :extra-fields="extraFields"
            :product-data="product"
            class="w-full"
          />

          <p class="mt-4 text-xs text-muted-foreground">
            Al enviar este formulario aceptas que te contactemos para darte el
            presupuesto.
          </p>
        </div>
      </aside>
    </div>
  </article>
</template>