<script setup lang="ts">
import { computed } from "vue";
import type { ProductDetailDto } from "~/server/services/cms/catalog.service";
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";
import ProductHero from "@/components/marketing/product/Hero.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";
import ProductDetails from "@/components/marketing/product/Details.vue";
import ProductFaq from "@/components/marketing/product/Faq.vue";

const route = useRoute();
const config = useRuntimeConfig();

const pageContainerClass = "container-content";
const contentNarrowClass = "mx-auto w-full max-w-[880px]";

function safeDecode(value: unknown) {
  try {
    return decodeURIComponent(String(value ?? ""));
  } catch {
    return String(value ?? "");
  }
}

function isAssetLike(value: unknown) {
  const s = String(value ?? "").trim();
  return /^(img|_nuxt)\//i.test(s) || /\.(jpg|jpeg|png|webp|avif|gif|svg|pdf)$/i.test(s);
}

const slug = computed(() =>
  safeDecode(
    Array.isArray(route.params.slug) ? route.params.slug.join("/") : route.params.slug
  ).trim()
);

if (!slug.value || isAssetLike(slug.value)) {
  throw createError({
    statusCode: 404,
    message: `Ruta estática inválida para producto: ${slug.value}`,
  });
}

const { data, pending, error } = await useAsyncData<ProductDetailDto | null>(
  () => `cms:product:${slug.value}`,
  () => $fetch(`/api/cms/product/${encodeURIComponent(slug.value)}`),
  {
    server: true,
    watch: [slug],
    default: () => null,
  }
);

if (error.value) {
  throw createError({
    statusCode: (error.value as any)?.statusCode || 404,
    message: "Producto no encontrado",
  });
}

if (data.value?.redirectTo && data.value.redirectTo !== route.path) {
  await navigateTo(data.value.redirectTo, {
    redirectCode: 301,
    replace: true,
  });
}

const product = computed(() => data.value ?? null);

const category = computed(() => {
  if (!product.value?.category) return null;

  return {
    slug: product.value.category.slug,
    path: product.value.category.path,
    title: product.value.category.title,
    nav: product.value.category.nav,
  };
});

const heroProduct = computed(() => {
  if (!product.value) return null;

  return {
    slug: product.value.slug,
    path: product.value.path,
    title: product.value.title,
    shortDescription: product.value.shortDescription || product.value.description || "",
    description: product.value.description || "",
    bodyMd: product.value.bodyMd || "",
    imageSrc: product.value.image?.src || null,
    image: product.value.image
      ? {
          src: product.value.image.src,
          alt: product.value.image.alt,
          width: product.value.image.width ?? null,
          height: product.value.image.height ?? null,
        }
      : null,
    formFields: product.value.formFields || [],
    extraFields: product.value.formFields || [],
    categorySlug: product.value.category?.slug || "",
    sku: (product.value as any).sku ?? null,
    seo: {
      canonical: product.value.seo?.canonical,
      metaTitle: product.value.seo?.title,
      metaDescription: product.value.seo?.description,
    },
  };
});

const breadcrumbItems = computed(() => product.value?.breadcrumbs ?? []);
const heroImage = computed(() => product.value?.image?.src || "");

const detailsTabs = computed(() => {
  const tabs: Array<{ id: string; title: string; text: string }> = [];

  const detailText =
    product.value?.bodyMd?.trim() ||
    product.value?.description?.trim() ||
    product.value?.shortDescription?.trim() ||
    "";

  if (detailText) {
    tabs.push({
      id: "descripcion",
      title: "Detalles del producto",
      text: detailText,
    });
  }

  return tabs;
});

/**
 * Tu DTO actual no expone FAQs reales todavía.
 * Lo dejamos preparado por si el service las devuelve más adelante.
 */
const faqs = computed<any[]>(() => ((product.value as any)?.faqs ?? []).filter(Boolean));

const canonicalUrl = computed(() => {
  const base = config.public.siteUrl || "https://reprodisseny.com";
  const path = product.value?.seo?.canonical || product.value?.path || route.path;
  return new URL(path, base).toString();
});

const hreflangLinks = computed(() =>
  (product.value?.seo?.hreflang || []).map((item) => ({
    rel: "alternate" as const,
    hreflang: item.lang,
    href: item.url,
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
    product.value?.seo?.title ||
    (product.value?.title
      ? `${product.value.title} | Reprodisseny`
      : "Producto | Reprodisseny"),
  description: () =>
    product.value?.seo?.description ||
    product.value?.shortDescription ||
    product.value?.description ||
    "Detalles de producto",
  ogTitle: () => product.value?.seo?.title || product.value?.title || "Producto",
  ogDescription: () =>
    product.value?.seo?.description ||
    product.value?.shortDescription ||
    product.value?.description ||
    "Detalles de producto",
  ogImage: () => product.value?.seo?.image || heroImage.value || undefined,
  robots: () => product.value?.seo?.robots || "index,follow",
});
</script>

<template>
  <main class="min-h-screen bg-background">
    <div v-if="pending" class="container-content py-16 md:py-20">
      <div class="flex min-h-[30vh] items-center justify-center rounded-[28px] border border-border/70 bg-card/70">
        <div class="animate-pulse text-body text-muted-foreground">
          Cargando detalles del producto...
        </div>
      </div>
    </div>

    <template v-else-if="product && heroProduct">
      <div class="container-content pt-4 pb-2 md:pt-6">
        <SiteBreadcrumbs :items="breadcrumbItems" :auto="false" />
      </div>

      <section :class="pageContainerClass" class="pb-10 md:pb-14">
        <ProductHero :product="heroProduct" :category="category" />
      </section>

      <section
        v-if="detailsTabs.length"
        id="detalles"
        class="bg-background"
        aria-labelledby="product-details-heading"
      >
        <div :class="pageContainerClass" class="py-10 md:py-14">
          <div :class="contentNarrowClass">
            <div class="max-w-[760px]">
              <p class="text-label uppercase tracking-[0.08em] text-primary">
                Información del producto
              </p>

              <h2
                id="product-details-heading"
                class="mt-3 text-[clamp(2rem,2.7vw,2.85rem)] font-bold leading-[1.08] tracking-tight text-foreground"
              >
                Detalles y especificaciones
              </h2>

              <p class="mt-3 max-w-[68ch] text-body text-foreground/78 md:text-[18px] md:leading-[1.68]">
                Consulta la información principal para entender mejor materiales, acabados y uso recomendado.
              </p>
            </div>

            <div class="mt-8 rounded-[28px] border border-border/70 bg-card px-5 py-6 shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)] md:px-8 md:py-8">
              <ProductDetails :tabs="detailsTabs" />
            </div>
          </div>
        </div>
      </section>

      <section
        v-if="faqs.length"
        class="bg-background"
        aria-labelledby="product-faq-heading"
      >
        <div :class="pageContainerClass" class="py-4 md:py-8">
          <div :class="contentNarrowClass">
            <div class="max-w-[760px]">
              <p class="text-label uppercase tracking-[0.08em] text-primary">
                Ayuda y dudas comunes
              </p>

              <h2
                id="product-faq-heading"
                class="mt-3 text-[clamp(2rem,2.7vw,2.85rem)] font-bold leading-[1.08] tracking-tight text-foreground"
              >
                Preguntas frecuentes
              </h2>
            </div>

            <div class="mt-8">
              <ProductFaq :faqs="faqs" />
            </div>
          </div>
        </div>
      </section>

      <section class="mt-12 md:mt-16">
        <GuideBanner
          title="¿No estás seguro de las medidas?"
          :cta="{ label: 'Consultar Guía', to: '/como-preparar-archivos' }"
          base-path="/img/ui/banners/como-preparar-archivos"
          :height="240"
          :full-bleed="true"
          :rounded="false"
        />
      </section>

      <section class="bg-background">
        <div :class="pageContainerClass" class="py-14 md:py-20">
          <div
            class="overflow-hidden rounded-[32px] border border-border/70 bg-[linear-gradient(135deg,hsl(var(--accent))_0%,hsl(var(--background))_100%)] px-6 py-8 shadow-[0_14px_36px_-26px_hsl(var(--foreground)/0.16)] md:px-10 md:py-10"
          >
            <div class="max-w-[760px]">
              <p class="text-label uppercase tracking-[0.08em] text-primary">
                Proyecto a medida
              </p>

              <h2 class="mt-3 text-[clamp(2rem,2.7vw,2.85rem)] font-bold leading-[1.08] tracking-tight text-foreground">
                ¿Tienes un proyecto especial?
              </h2>

              <p class="mt-3 max-w-[60ch] text-body text-foreground/76 md:text-[18px] md:leading-[1.68]">
                Si no encuentras exactamente lo que necesitas en los detalles del producto,
                te asesoramos para fabricar una solución adaptada a tu proyecto.
              </p>

              <div class="mt-6">
                <NuxtLink
                  to="/contacto"
                  class="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-body-s-bold text-primary-foreground transition hover:opacity-90"
                >
                  Contactar con un asesor
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="container-content py-16 md:py-20">
      <div class="rounded-[28px] border border-border/70 bg-card p-8 shadow-sm">
        <h1 class="text-[28px] font-semibold leading-[1.2] text-foreground">
          Producto no encontrado
        </h1>
        <p class="mt-3 max-w-[60ch] text-body text-foreground/72">
          No hemos podido cargar este producto.
        </p>
      </div>
    </div>
  </main>
</template>