<script setup lang="ts">
import { computed } from "vue";
import type { CategoryDetailPageDto } from "~/server/services/cms/catalog.service";
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";
import CategoryContent from "@/components/marketing/category/CategoryContent.vue";
import CategoryHero from "@/components/marketing/category/CategoryHero.vue";
import CategoryProductsGrid from "@/components/marketing/category/CategoryProductsGrid.vue";
import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";

const route = useRoute();
const config = useRuntimeConfig();

const pageContainerClass = "container-content";
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

function looksLikeProductPath(value: string) {
  return /^productos?\//i.test(String(value || "").trim());
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

const slugParts = computed(() => {
  const raw = route.params.slug;

  return Array.isArray(raw)
    ? raw.map((s) => safeDecode(s).trim()).filter(Boolean)
    : String(safeDecode(raw ?? ""))
        .split(/[\/,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
});

const slug = computed(() => slugParts.value.join("/"));
const apiSlug = computed(() => slugParts.value.map((part) => encodeURIComponent(part)).join("/"));
const childrenGridClass = computed(() => {
  const count = children.value.length;

  if (count <= 1) {
    return "mx-auto max-w-[520px] grid-cols-1";
  }

  if (count === 2) {
    return "mx-auto max-w-[1080px] grid-cols-1 justify-items-center sm:grid-cols-2";
  }

  return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
});

if (!slug.value || isAssetLike(slug.value) || looksLikeProductPath(slug.value)) {
  throw createError({
    statusCode: 404,
    statusMessage: "Categoría no encontrada",
    message: `Ruta inválida para categoría: ${slug.value}`,
  });
}

const { data, pending, error } = await useAsyncData<CategoryDetailPageDto | null>(
  () => `cms:category:${slug.value}`,
  () =>
    $fetch(`/api/cms/category/${apiSlug.value}`, {
      query: {
        includeProducts: 1,
        productLimit: 24,
        includeChildren: 1,
        childLimit: 50,
      },
    }),
  {
    server: true,
    watch: [slug],
    default: () => null,
  }
);

if (data.value?.redirectTo && data.value.redirectTo !== route.path) {
  await navigateTo(data.value.redirectTo, {
    redirectCode: 301,
    replace: true,
  });
}

const fetchError = computed(() => (error.value as any) || null);
const category = computed(() => data.value as CategoryDetailPageDto | null);
const children = computed(() =>
  Array.isArray(category.value?.children) ? category.value.children : []
);
const products = computed(() =>
  Array.isArray(category.value?.products) ? category.value.products : []
);
const sections = computed(() =>
  Array.isArray(category.value?.sections) ? category.value.sections : []
);
const faqs = computed(() =>
  Array.isArray(category.value?.faqs) ? category.value.faqs : []
);
const breadcrumbItems = computed(() =>
  Array.isArray(category.value?.breadcrumbs) ? category.value.breadcrumbs : []
);
const heroImage = computed(() => category.value?.image?.src || "");

const secondaryCta = computed(() => {
  if (products.value.length) {
    return { label: "Ver productos", to: "#productos" };
  }

  if (children.value.length) {
    return { label: "Explorar subcategorías", to: "#subcategorias" };
  }

  return undefined;
});

const canonicalUrl = computed(() => {
  return (
    toAbsoluteUrl(category.value?.seo?.canonical || category.value?.path || route.path) ||
    toAbsoluteUrl("/") ||
    "https://reprodisseny.com"
  );
});

const ogImageUrl = computed(() => {
  return toAbsoluteUrl(category.value?.seo?.image || heroImage.value);
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
}));

useSeoMeta({
  title: () =>
    category.value?.seo?.title ||
    (category.value?.title ? `${category.value.title} | Reprodisseny` : "Categoría | Reprodisseny"),

  description: () =>
    category.value?.seo?.description || category.value?.description || "Categoría de productos",

  ogTitle: () => category.value?.seo?.title || category.value?.title || "Categoría",

  ogDescription: () =>
    category.value?.seo?.description || category.value?.description || "Categoría de productos",

  ogUrl: () => canonicalUrl.value,
  ogImage: () => ogImageUrl.value,
  robots: () => category.value?.seo?.robots || "index,follow",

  twitterCard: () => (ogImageUrl.value ? "summary_large_image" : "summary"),
  twitterTitle: () => category.value?.seo?.title || category.value?.title || "Categoría",
  twitterDescription: () =>
    category.value?.seo?.description || category.value?.description || "Categoría de productos",
  twitterImage: () => ogImageUrl.value,
});
</script>

<template>
  <main class="min-h-screen bg-background">
    <div v-if="pending" class="container-content py-16 md:py-20">
      <div class="flex min-h-[30vh] items-center justify-center rounded-[28px] border border-border/70 bg-card/70">
        <div class="animate-pulse text-body text-muted-foreground">
          Cargando categoría...
        </div>
      </div>
    </div>

    <template v-else-if="category">
      <div class="container-content pb-2 pt-4 md:pt-6">
        <SiteBreadcrumbs :items="breadcrumbItems" :auto="false" />
      </div>

      <section class="pb-8 md:pb-10">
        <CategoryHero
          :category="category"
          :primary-cta="{ label: 'Pedir presupuesto', to: '/contacto' }"
          :secondary-cta="secondaryCta"
        />
      </section>

      <section
  v-if="children.length"
  id="subcategorias"
  class="bg-background"
  aria-label="Subcategorías"
>
  <div :class="pageContainerClass" class="py-10 md:py-14">
    <div :class="sectionIntroClass">
      <ContentSectionIntro
        eyebrow="Subcategorías"
        title="Explora esta línea de soluciones"
        description="Accede directamente a las subcategorías relacionadas con esta área."
        heading-tag="h2"
        heading-size="section"
        :line="false"
        title-tone="foreground"
      />
    </div>

    <div :class="['mt-8 grid gap-6', childrenGridClass]">
      <NuxtLink
        v-for="child in children"
        :key="child.slug || child.path"
        :to="child.path"
        class="group flex h-full w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_40px_-26px_hsl(var(--foreground)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
      >
        <div class="aspect-[16/10] overflow-hidden bg-muted/25">
          <img
            v-if="child.image?.src"
            :src="child.image.src"
            :alt="child.image.alt || child.title || 'Subcategoría'"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
          <div v-else class="h-full w-full bg-muted/40" />
        </div>

        <div class="flex flex-1 flex-col px-5 py-5">
          <h3 class="text-[20px] font-semibold leading-[1.25] text-foreground">
            {{ child.title }}
          </h3>

          <p
            v-if="child.description"
            class="mt-3 line-clamp-3 text-body-s leading-[1.6] text-foreground/72"
          >
            {{ child.description }}
          </p>

          <span
            class="mt-5 inline-flex min-h-11 items-center justify-center self-start rounded-lg border border-border bg-background px-4 py-2.5 text-body-s-bold text-foreground transition group-hover:border-primary/25 group-hover:text-primary"
          >
            Ver subcategoría
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</section>

<CategoryProductsGrid
  :products="products"
  eyebrow="Productos relacionados"
  title="Productos de esta categoría"
  description="Explora formatos y soluciones relacionadas."
/>

<CategoryContent
  :sections="sections"
  :faqs="faqs"
  faq-title="Preguntas frecuentes sobre esta categoría"
  faq-subtitle="Respondemos las dudas más habituales sobre materiales, acabados, formatos y tiempos de producción."
/>

      


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
  <ContentSectionIntro
    eyebrow="Asesoramiento personalizado"
    title="¿Necesitas ayuda para elegir la mejor opción?"
    description="Te ayudamos a comparar materiales, formatos, acabados y aplicaciones para encontrar la solución más adecuada para tu proyecto."
    heading-tag="h2"
    heading-size="section"
    :line="false"
    title-tone="foreground"
    eyebrow-class="uppercase tracking-[0.08em]"
    description-class="max-w-[60ch] text-body text-foreground/76 md:text-[18px] md:leading-[1.68]"
  />

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
          Categoría no encontrada
        </h1>
        <p class="mt-3 max-w-[60ch] text-body text-foreground/72">
          No hemos podido cargar esta categoría.
        </p>
        <p v-if="fetchError" class="mt-3 text-body-s text-destructive/80">
          {{ fetchError?.data?.message || fetchError?.message || 'El endpoint devolvió error.' }}
        </p>
      </div>
    </div>
  </main>
</template>
