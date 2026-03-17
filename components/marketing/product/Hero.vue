<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
  import LeadRequestSection from "@/components/marketing/product/LeadRequestSection.vue";
  
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
      class="w-full"
      itemscope
      itemtype="https://schema.org/Product"
      :aria-label="
        productTitle ? `Página del producto ${productTitle}` : 'Página de producto'
      "
    >
      <header class="mb-8 md:mb-10">
        <div class="max-w-[980px] space-y-4">
          <h1
            class="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl"
            :title="productTitle"
            itemprop="name"
          >
            {{ productTitle }}
          </h1>
  
          <p
            v-if="productDesc"
            class="max-w-[760px] text-sm leading-7 text-muted-foreground md:text-base"
            itemprop="description"
          >
            {{ productDesc }}
          </p>
        </div>
      </header>
  
      <div class="grid items-start gap-10 lg:grid-cols-[minmax(0,760px)_420px] lg:gap-14">
        <section class="min-w-0 self-start">
          <figure
            class="overflow-hidden rounded-2xl border border-border bg-card"
            itemprop="image"
          >
            <NuxtImg
              :src="currentImgSrc"
              :alt="imgAlt"
              class="aspect-[16/10] w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 760px"
              width="760"
              height="475"
              fetchpriority="high"
              preload
              @error="onImageError"
            />
          </figure>
  
          <p class="mt-3 text-xs text-muted-foreground">
            ¿Dudas con medidas o archivos? Completa el formulario y te orientamos.
          </p>
        </section>
  
        <aside class="min-w-0 lg:sticky lg:top-24">
          <div class="product-form-card">
            <LeadRequestSection
              :producto="productTitle"
              :category-slug="categorySlug"
              :extra-fields="extraFields"
              :product-data="product"
              class="w-full"
            />
  
            <p class="mt-4 product-form-helper">
              Al enviar este formulario aceptas que te contactemos para darte el
              presupuesto.
            </p>
          </div>
        </aside>
      </div>
    </article>
  </template>