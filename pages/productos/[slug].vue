<script setup lang="ts">
import { computed } from "vue";
import type { ProductDetailDto } from "~/server/services/cms/catalog.service";
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";
import ProductHero from "@/components/marketing/product/Hero.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";
import ProductSections from "@/components/marketing/product/ProductSections.vue";
import ProductFaq from "@/components/marketing/product/ProductFaq.vue";

const route = useRoute();
const config = useRuntimeConfig();

const pageContainerClass = "container-content";
const contentNarrowClass = "mx-auto w-full max-w-4xl";
const sectionIntroClass = "max-w-3xl";

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

function toAbsoluteUrl(value?: string | null) {
  if (!value) return undefined;

  const base = config.public.siteUrl || "https://reprodisseny.com";

  try {
    return new URL(value, base).toString();
  } catch {
    return undefined;
  }
}

const slug = computed(() =>
  safeDecode(
    Array.isArray(route.params.slug) ? route.params.slug.join("/") : route.params.slug
  ).trim()
);

if (!slug.value || isAssetLike(slug.value)) {
  throw createError({
    statusCode: 404,
    statusMessage: "Producto no encontrado",
    message: `Ruta inválida para producto: ${slug.value}`,
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
  const err = error.value as any;

  throw createError({
    statusCode: err?.statusCode || err?.status || err?.response?.status || 404,
    statusMessage: "Producto no encontrado",
    message: err?.data?.message || err?.message || "No hemos podido cargar el producto",
  });
}

if (data.value?.redirectTo && data.value.redirectTo !== route.path) {
  await navigateTo(data.value.redirectTo, {
    redirectCode: 301,
    replace: true,
  });
}

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Producto no encontrado",
    message: `No existe el producto "${slug.value}"`,
  });
}

const product = computed(() => data.value as ProductDetailDto);

const category = computed(() => {
  const current = product.value?.category;
  if (!current) return null;

  return {
    slug: current.slug,
    path: current.path,
    title: current.title,
    nav: current.nav,
  };
});

const heroProduct = computed(() => {
  const current = product.value;
  if (!current) return null;

  return {
    slug: current.slug,
    path: current.path,
    title: current.title,
    shortDescription: current.shortDescription || current.description || "",
    description: current.description || "",
    bodyMd: current.bodyMd || "",
    imageSrc: current.image?.src || null,
    image: current.image
      ? {
          src: current.image.src,
          alt: current.image.alt,
          width: current.image.width ?? null,
          height: current.image.height ?? null,
        }
      : null,
    formFields: current.formFields || [],
    extraFields: (current as any).extraFields || current.formFields || [],
    categorySlug: current.category?.slug || "",
    sku: (current as any).sku ?? null,
    seo: {
      canonical: current.seo?.canonical,
      metaTitle: current.seo?.title,
      metaDescription: current.seo?.description,
    },
  };
});

const breadcrumbItems = computed(() =>
  Array.isArray(product.value?.breadcrumbs) ? product.value.breadcrumbs : []
);

const sections = computed(() =>
  (Array.isArray(product.value?.sections) ? product.value.sections : []).filter(Boolean)
);
const faqs = computed(() =>
  (Array.isArray(product.value?.faqs) ? product.value.faqs : []).filter(Boolean)
);

const heroImage = computed(() => product.value?.image?.src || "");

const canonicalUrl = computed(() => {
  return (
    toAbsoluteUrl(product.value?.seo?.canonical || product.value?.path || route.path) ||
    toAbsoluteUrl("/") ||
    "https://reprodisseny.com"
  );
});

const hreflangLinks = computed(
  () =>
    (product.value?.seo?.hreflang || [])
      .map((item) => {
        const href = toAbsoluteUrl(item?.url);
        if (!href || !item?.lang) return null;

        return {
          rel: "alternate" as const,
          hreflang: item.lang,
          href,
        };
      })
      .filter(Boolean) as Array<{
      rel: "alternate";
      hreflang: string;
      href: string;
    }>
);

const ogImageUrl = computed(() => {
  return toAbsoluteUrl(product.value?.seo?.image || heroImage.value);
});

const schemaJson = computed(() => {
  const schema = product.value?.seo?.schema;
  return schema ? JSON.stringify(schema) : "";
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }, ...hreflangLinks.value],
  script: schemaJson.value
    ? [
        {
          key: "product-jsonld",
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

  ogUrl: () => canonicalUrl.value,
  ogImage: () => ogImageUrl.value,
  robots: () => product.value?.seo?.robots || "index,follow",

  twitterCard: () => (ogImageUrl.value ? "summary_large_image" : "summary"),
  twitterTitle: () => product.value?.seo?.title || product.value?.title || "Producto",
  twitterDescription: () =>
    product.value?.seo?.description ||
    product.value?.shortDescription ||
    product.value?.description ||
    "Detalles de producto",
  twitterImage: () => ogImageUrl.value,
});
</script>

<template>
  <main class="min-h-screen bg-background">
    <div v-if="pending" class="container-content py-16 md:py-20">
      <div
        class="flex min-h-[30vh] items-center justify-center rounded-[28px] border border-border/70 bg-card/70"
      >
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
        v-if="sections.length"
        id="detalles"
        class="bg-background"
        aria-labelledby="product-details-heading"
      >
        <div :class="pageContainerClass" class="py-10 md:py-14">
          <div :class="contentNarrowClass">
            <div :class="sectionIntroClass">
              <p class="text-label uppercase tracking-[0.08em] text-primary">
                Información del producto
              </p>

              <h2
                id="product-details-heading"
                class="mt-3 text-[clamp(2rem,2.7vw,2.85rem)] font-bold leading-[1.08] tracking-tight text-foreground"
              >
                Detalles y especificaciones
              </h2>

              <p
                class="mt-3 max-w-[68ch] text-body text-foreground/78 md:text-[18px] md:leading-[1.68]"
              >
                Consulta la información principal para entender mejor materiales, acabados
                y uso recomendado.
              </p>
            </div>

            <div class="mt-8">
              <ProductSections
                :sections="sections"
                :show-section-nav="sections.length > 1"
              />
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
            <div :class="sectionIntroClass">
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
          :cta="{ label: 'Consultar guía', to: '/como-preparar-archivos' }"
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
            <div :class="sectionIntroClass">
              <p class="text-label uppercase tracking-[0.08em] text-primary">
                Proyecto a medida
              </p>

              <h2
                class="mt-3 text-[clamp(2rem,2.7vw,2.85rem)] font-bold leading-[1.08] tracking-tight text-foreground"
              >
                ¿Tienes un proyecto especial?
              </h2>

              <p
                class="mt-3 max-w-[60ch] text-body text-foreground/76 md:text-[18px] md:leading-[1.68]"
              >
                Si no encuentras exactamente lo que necesitas en los detalles del
                producto, te asesoramos para fabricar una solución adaptada a tu proyecto.
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
  </main>
</template>
