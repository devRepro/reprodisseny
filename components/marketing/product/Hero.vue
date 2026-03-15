<script setup lang="ts">
import { shallowRef, onMounted, computed, ref, watch } from "vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";

const props = defineProps<{
  product: any;
  category?: any;
}>();

const FALLBACK = "/img/placeholders/producto.webp";

const resolvedImgSrc = computed(() => {
  const src =
    props.product?.imageSrc ||
    (typeof props.product?.image === "string"
      ? props.product?.image
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
  const x = props.product?.image;
  return (
    (typeof x === "object" ? x?.alt : undefined) || props.product?.title || "Producto"
  );
});

const extraFields = computed(
  () => props.product?.formFields || props.product?.extraFields || []
);

const categorySlug = computed(
  () => props.category?.slug || props.product?.categorySlug || ""
);

const productTitle = computed(() => props.product?.title || "");
const productDesc = computed(
  () => props.product?.shortDescription || props.product?.description || ""
);

const LeadRequestSectionCmp = shallowRef<any>(null);
const leadSectionLoadError = ref<unknown>(null);

onMounted(async () => {
  try {
    LeadRequestSectionCmp.value = (
      await import("@/components/marketing/product/LeadRequestSection.vue")
    ).default;
  } catch (e) {
    leadSectionLoadError.value = e;
    console.error("LeadRequestSection import failed:", e);
  }
});
</script>

<template>
  <article
    class="w-full"
    itemscope
    itemtype="https://schema.org/Product"
    :aria-label="`Página del producto ${productTitle}`"
  >
    <div class="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
      <section class="min-w-0 self-start lg:sticky lg:top-24">
        <header class="space-y-4">
          <h1
            class="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
            itemprop="name"
          >
            {{ productTitle }}
          </h1>

          <p
            v-if="productDesc"
            class="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base"
            itemprop="description"
          >
            {{ productDesc }}
          </p>
        </header>

        <figure
          class="mt-6 overflow-hidden rounded-2xl border border-border bg-card"
          itemprop="image"
        >
          <NuxtImg
            :src="currentImgSrc"
            :alt="imgAlt"
            class="aspect-[4/3] w-full object-cover sm:aspect-square"
            sizes="(max-width: 1024px) 100vw, 560px"
            width="900"
            height="900"
            fetchpriority="high"
            preload
            @error="onImageError"
          />
        </figure>

        <p class="mt-3 text-xs text-muted-foreground">
          ¿Dudas con medidas o archivos? Completa el formulario y te orientamos.
        </p>
      </section>

      <section class="min-w-0">
        <div class="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div class="mt-5">
            <ClientOnly>
              <div
                v-if="leadSectionLoadError"
                class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                Error cargando el formulario. Por favor, recarga la página o inténtalo más
                tarde.
              </div>

              <component
                v-else-if="LeadRequestSectionCmp"
                :is="LeadRequestSectionCmp"
                :producto="productTitle"
                :product-data="product"
                :extra-fields="extraFields"
                :category-slug="categorySlug"
                class="w-full"
              />

              <template #fallback>
                <div class="space-y-4" aria-label="Cargando formulario">
                  <div v-for="i in 6" :key="i" class="space-y-2">
                    <div class="h-4 w-28 rounded bg-muted" />
                    <div
                      class="h-12 w-full rounded-xl border border-border bg-background"
                    />
                  </div>
                  <div class="h-12 w-full rounded-xl bg-muted" />
                </div>
              </template>
            </ClientOnly>
          </div>

          <p class="mt-4 text-xs text-muted-foreground">
            Al enviar este formulario aceptas que te contactemos para darte el
            presupuesto.
          </p>
        </div>
      </section>
    </div>
  </article>
</template>
