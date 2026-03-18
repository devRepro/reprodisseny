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

const productDesc = computed(() => {
  return props.product?.shortDescription || props.product?.description || "";
});
</script>

<template>
  <article
    class="mx-auto w-full max-w-[1280px]"
    itemscope
    itemtype="https://schema.org/Product"
    :aria-label="
      productTitle ? `Página del producto ${productTitle}` : 'Página de producto'
    "
  >
    <meta v-if="product?.sku" itemprop="sku" :content="String(product.sku)" />

    <div
      class="grid items-start gap-8 xl:gap-12 2xl:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(460px,520px)]"
    >
      <section class="min-w-0 self-start">
        <div class="mx-auto lg:mx-0 lg:max-w-[760px] xl:max-w-[720px]">
          <header class="space-y-4">
            <h1
              class="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl lg:text-[3.1rem] lg:leading-[1.05] [overflow-wrap:anywhere]"
              :title="productTitle"
              itemprop="name"
            >
              {{ productTitle }}
            </h1>

            <p
              v-if="productDesc"
              class="max-w-[72ch] text-sm leading-7 text-muted-foreground md:text-base md:leading-8"
              itemprop="description"
            >
              {{ productDesc }}
            </p>
          </header>

          <figure
            class="mt-6 overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
            itemprop="image"
          >
            <NuxtImg
              :src="currentImgSrc"
              :alt="imgAlt"
              class="aspect-[16/11] w-full object-cover"
              sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 58vw, 720px"
              width="720"
              height="495"
              densities="x1 x2"
              fetchpriority="high"
              preload
              @error="onImageError"
            />
          </figure>

          <p class="mt-4 mb-0 text-sm leading-6 text-muted-foreground">
            ¿Dudas con medidas, materiales o archivos? Completa el formulario y te
            ayudamos a elegir la mejor opción para tu proyecto.
          </p>
        </div>
      </section>

      <aside class="min-w-0 lg:sticky lg:top-24">
        <div class="product-form-card rounded-[28px] md:p-7 xl:p-8">
          <LeadForm
            :producto="productTitle"
            :category-slug="categorySlug"
            :extra-fields="extraFields"
            :product-data="product"
            class="w-full"
          />

          <p class="mt-5 mb-0 text-label-s text-muted-foreground">
            Al enviar este formulario aceptas que te contactemos para preparar tu
            presupuesto y resolver cualquier duda técnica relacionada con este producto.
          </p>
        </div>
      </aside>
    </div>
  </article>
</template>