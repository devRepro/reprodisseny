<script setup lang="ts">
import { computed } from "vue";
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";
import ProductHero from "@/components/marketing/product/Hero.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";
import ProductDetails from "@/components/marketing/product/Details.vue";
import ProductFaq from "@/components/marketing/product/Faq.vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";

type CmsImage = {
  src?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

type CmsSeoHreflang = {
  lang?: string;
  url?: string;
};

type CmsSeo = {
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  hreflang?: CmsSeoHreflang[];
  schema?: Record<string, unknown>;
};

type CmsCategory = {
  slug?: string;
  path?: string;
  title?: string;
};

type CmsProduct = {
  id?: string;
  slug?: string;
  path?: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  bodyMd?: string;
  imageSrc?: string | null;
  image?: CmsImage | null;
  categorySlug?: string;
  seo?: CmsSeo;
  formFields?: any[];
  extraFields?: any[];
};

type CmsProductPageData = {
  product?: CmsProduct | null;
  category?: CmsCategory | null;
  detailsTabs?: any[];
  faqs?: any[];
  redirectTo?: string;
};

const route = useRoute();
const config = useRuntimeConfig();

const slug = computed(() => String(route.params.slug || "").trim());

const containerClass = "container-wide";
const contentNarrowClass = "mx-auto w-full max-w-[880px]";

const { data, pending, error } = await useAsyncData<CmsProductPageData>(
  () => `cms:product:${slug.value}`,
  () =>
    $fetch(`/api/cms/product/${slug.value}`, {
      params: { includeRelated: 1, relatedLimit: 4 },
    }),
  { server: true }
);

if (error.value) {
  throw createError({
    statusCode: (error.value as any)?.statusCode || 404,
    message: "Producto no encontrado",
  });
}

const rawProduct = computed(() => data.value?.product || null);
const category = computed(() => data.value?.category || null);
const detailsTabs = computed(() => data.value?.detailsTabs || []);
const faqs = computed(() => data.value?.faqs || []);

const product = computed<CmsProduct | null>(() => {
  if (!rawProduct.value) return null;

  const normalizedSrc = normalizeCmsMediaSrc(
    rawProduct.value.imageSrc || rawProduct.value.image?.src || ""
  );

  return {
    ...rawProduct.value,
    imageSrc: normalizedSrc || rawProduct.value.imageSrc || null,
    image: rawProduct.value.image
      ? {
          ...rawProduct.value.image,
          src: normalizedSrc || rawProduct.value.image?.src || null,
        }
      : rawProduct.value.image,
  };
});

if (product.value?.path && product.value.path !== route.path) {
  await navigateTo(product.value.path, {
    redirectCode: 301,
    replace: true,
  });
}

const breadcrumbItems = computed(() => {
  const items: Array<{ label: string; to?: string }> = [
    { label: "Inicio", to: "/" },
    { label: "Productos", to: "/productos" },
  ];

  if (category.value?.title) {
    items.push({
      label: category.value.title,
      to: category.value.path || undefined,
    });
  }

  if (product.value?.title) {
    items.push({ label: product.value.title });
  }

  return items;
});

const canonicalUrl = computed(() => {
  if (product.value?.seo?.canonical) return product.value.seo.canonical;

  const base = config.public.siteUrl || "https://reprodisseny.com";
  const path = product.value?.path || route.path;
  return new URL(path, base).toString();
});

const hreflangLinks = computed(() =>
  (product.value?.seo?.hreflang || [])
    .filter((x) => x?.lang && x?.url)
    .map((x) => ({
      rel: "alternate",
      hreflang: x!.lang!,
      href: x!.url!,
    }))
);

const schemaJson = computed(() => {
  const schema = product.value?.seo?.schema;
  return schema ? JSON.stringify(schema) : "";
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }, ...hreflangLinks.value],
  script: schemaJson.value
    ? [
        {
          type: "application/ld+json",
          children: schemaJson.value,
        },
      ]
    : [],
}));

useSeoMeta({
  title: () =>
    product.value?.seo?.metaTitle ||
    (product.value?.title
      ? `${product.value.title} | Reprodisseny`
      : "Producto | Reprodisseny"),
  description: () =>
    product.value?.seo?.metaDescription ||
    product.value?.shortDescription ||
    product.value?.description ||
    "Detalles de producto",
  ogTitle: () => product.value?.seo?.metaTitle || product.value?.title || "Producto",
  ogDescription: () =>
    product.value?.seo?.metaDescription ||
    product.value?.shortDescription ||
    product.value?.description ||
    "Detalles de producto",
  ogImage: () => product.value?.image?.src || product.value?.imageSrc || undefined,
});
</script>

<template>
  <main class="min-h-screen bg-background">
    <nav class="border-b border-border bg-background/60">
      <div :class="containerClass" class="py-4">
        <SiteBreadcrumbs :items="breadcrumbItems" :auto="false" />
      </div>
    </nav>

    <div v-if="pending" class="flex min-h-[40vh] items-center justify-center">
      <div class="animate-pulse font-medium text-muted-foreground">
        Cargando detalles del producto...
      </div>
    </div>

    <template v-else-if="product">
      <section :class="containerClass" class="pt-8 md:pt-16">
        <ProductHero :product="product" :category="category" />
      </section>

      <section class="mt-16 md:mt-24">
        <GuideBanner
          title="¿No estás seguro de las medidas?"
          :cta="{ label: 'Consultar Guía', to: '/como-preparar-archivos' }"
          base-path="/img/ui/banners/como-preparar-archivos"
          :height="240"
          :full-bleed="true"
          :rounded="false"
        />
      </section>

      <section
        id="detalles"
        class="mt-20 border-y border-border bg-muted/20 py-20 md:mt-32"
      >
        <div :class="containerClass">
          <div :class="contentNarrowClass">
            <h2 class="mb-10 text-center">Especificaciones técnicas</h2>
            <ProductDetails :tabs="detailsTabs" />
          </div>
        </div>
      </section>

      <section class="py-20">
        <div :class="containerClass">
          <div :class="contentNarrowClass">
            <h2 class="mb-8 text-center">Dudas frecuentes</h2>
            <ProductFaq :faqs="faqs" />
          </div>
        </div>
      </section>

      <section class="bg-brand-dark py-16 text-center text-brand-ink-light">
        <div class="container-wide">
          <h2>¿Tienes un proyecto especial?</h2>
          <p class="mx-auto mt-4 max-w-xl text-brand-ink-light/80">
            Si no encuentras lo que buscas en los detalles, contáctanos directamente y lo
            fabricaremos a medida.
          </p>
          <button
            class="mt-8 rounded-full bg-background px-10 py-4 font-semibold text-foreground transition-colors hover:bg-brand-bg-2"
          >
            Contactar con un asesor
          </button>
        </div>
      </section>
    </template>

    <div v-else class="container-wide py-16">
      <div class="rounded-2xl border bg-card p-8">
        <h1 class="text-2xl font-semibold">Producto no encontrado</h1>
        <p class="mt-3 text-muted-foreground">No hemos podido cargar este producto.</p>
      </div>
    </div>
  </main>
</template>
