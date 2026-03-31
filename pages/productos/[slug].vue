<script setup lang="ts">
import { computed } from "vue";
import type { ProductDetailDto } from "~/server/services/cms/catalog.service";
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";
import ProductHero from "@/components/marketing/product/Hero.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";
import ProductSections from "@/components/marketing/product/ProductSections.vue";
import FaqAccordion from "@/components/shared/blocks/FaqAccordion.vue";
import ContentSectionShell from "@/components/marketing/content/ContentSectionShell.vue";

const route = useRoute();
const config = useRuntimeConfig();

const pageContainerClass = "container-content";
const pageFlowClass = "space-y-16 md:space-y-20";
const pageBottomSpacingClass = "pb-16 md:pb-24";

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
    Array.isArray(route.params.slug)
      ? route.params.slug.join("/")
      : route.params.slug
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
    message:
      err?.data?.message ||
      err?.message ||
      "No hemos podido cargar el producto",
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

const breadcrumbItems = computed(() =>
  Array.isArray(product.value?.breadcrumbs) ? product.value.breadcrumbs : []
);

const sections = computed(() =>
  Array.isArray(product.value?.sections)
    ? product.value.sections.filter(Boolean)
    : []
);

const faqs = computed(() =>
  Array.isArray(product.value?.faqs)
    ? product.value.faqs.filter(Boolean)
    : []
);

const hasSections = computed(() => sections.value.length > 0);
const hasFaqs = computed(() => faqs.value.length > 0);

const heroImage = computed(() => product.value?.image?.src || "");

const heroProduct = computed(() => {
  const current = product.value;
  if (!current) return null;

  const extraFields = Array.isArray((current as any).extraFields)
    ? (current as any).extraFields
    : Array.isArray(current.formFields)
      ? current.formFields
      : [];

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
    formFields: Array.isArray(current.formFields) ? current.formFields : [],
    extraFields,
    categorySlug: current.category?.slug || "",
    sku: (current as any).sku ?? null,
    seo: {
      canonical: current.seo?.canonical,
      metaTitle: current.seo?.title,
      metaDescription: current.seo?.description,
    },
  };
});

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

  ogTitle: () =>
    product.value?.seo?.title ||
    product.value?.title ||
    "Producto",

  ogDescription: () =>
    product.value?.seo?.description ||
    product.value?.shortDescription ||
    product.value?.description ||
    "Detalles de producto",

  ogUrl: () => canonicalUrl.value,
  ogImage: () => ogImageUrl.value,
  ogType: "product",
  robots: () => product.value?.seo?.robots || "index,follow",

  twitterCard: () => (ogImageUrl.value ? "summary_large_image" : "summary"),
  twitterTitle: () =>
    product.value?.seo?.title ||
    product.value?.title ||
    "Producto",
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
      <div class="container-content pt-4 pb-4 md:pt-6 md:pb-6">
        <SiteBreadcrumbs :items="breadcrumbItems" :auto="false" />
      </div>

      <div :class="pageBottomSpacingClass">
        <div :class="pageFlowClass">
          <section :class="pageContainerClass" aria-label="Presentación del producto">
            <ProductHero :product="heroProduct" :category="category" />
          </section>

          <ContentSectionShell
            v-if="hasSections"
            eyebrow="Información del producto"
            title="Características, formatos y acabados"
            description="Consulta la información clave para valorar opciones, materiales y usos recomendados antes de solicitar tu presupuesto."
          >
            <ProductSections
              :sections="sections"
              :show-section-nav="sections.length > 1"
            />
          </ContentSectionShell>

          <ContentSectionShell
            v-if="hasFaqs"
            eyebrow="Ayuda y dudas comunes"
            title="Preguntas frecuentes"
            description="Resolvemos las consultas más habituales sobre materiales, medidas, acabados, preparación y entrega."
          >
            <FaqAccordion :items="faqs" />
          </ContentSectionShell>
          
          <section aria-label="Guía de preparación de archivos">
            <GuideBanner
              title="¿No estás seguro de las medidas?"
              :cta="{ label: 'Consultar guía', to: '/como-preparar-archivos' }"
              base-path="/img/ui/banners/como-preparar-archivos"
              :height="240"
              :full-bleed="true"
              :rounded="false"
            />
          </section>

          <ContentSectionShell
            eyebrow="Proyecto a medida"
            title="¿Tienes un proyecto especial?"
            description="Si no encuentras exactamente lo que necesitas en los detalles del producto, te asesoramos para fabricar una solución adaptada a tu proyecto."
          >
            <NuxtLink
              to="/contacto"
              class="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-body-s-bold text-primary-foreground transition hover:opacity-90"
            >
              Contactar con un asesor
            </NuxtLink>
          </ContentSectionShell>
        </div>
      </div>
    </template>
  </main>
</template>