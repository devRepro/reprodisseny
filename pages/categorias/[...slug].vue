<script setup lang="ts">
import { computed } from "vue";
import type { CategoryDetailPageDto } from "~/server/services/cms/catalog.service";
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";
import CategoryContent from "@/components/marketing/category/CategoryContent.vue";
import CategoryHero from "@/components/marketing/category/CategoryHero.vue";

const route = useRoute();
const config = useRuntimeConfig();

function safeDecode(value: unknown) {
  try {
    return decodeURIComponent(String(value ?? ""));
  } catch {
    return String(value ?? "");
  }
}

function isAssetLike(v: unknown) {
  const s = String(v ?? "").trim();
  return /^(img|_nuxt)\//i.test(s) || /\.(jpg|jpeg|png|webp|avif|gif|svg|pdf)$/i.test(s);
}

function looksLikeProductPath(value: string) {
  return /^productos?\//i.test(String(value || "").trim());
}

const slug = computed(() => {
  const raw = route.params.slug;

  const parts = Array.isArray(raw)
    ? raw.map((s) => safeDecode(s).trim()).filter(Boolean)
    : String(safeDecode(raw ?? ""))
        .split(/[\/,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

  return parts.join("/");
});

if (!slug.value || isAssetLike(slug.value) || looksLikeProductPath(slug.value)) {
  throw createError({
    statusCode: 404,
    message: `Ruta inválida para categoría: ${slug.value}`,
  });
}

const { data, pending, error } = await useAsyncData<CategoryDetailPageDto>(
  () => `cms:category:${slug.value}`,
  () => $fetch(`/api/cms/category/${encodeURIComponent(slug.value)}`),
  { server: true }
);

if (error.value) {
  throw createError({
    statusCode: (error.value as any)?.statusCode || 404,
    message: "Categoría no encontrada",
  });
}

if (data.value?.redirectTo && data.value.redirectTo !== route.path) {
  await navigateTo(data.value.redirectTo, {
    redirectCode: 301,
    replace: true,
  });
}

const category = computed(() => data.value ?? null);
const children = computed(() => category.value?.children ?? []);
const products = computed(() => category.value?.products ?? []);
const tabs = computed(() => category.value?.tabs ?? []);
const faqs = computed(() => category.value?.faqs ?? []);
const breadcrumbItems = computed(() => category.value?.breadcrumbs ?? []);
const heroImage = computed(() => category.value?.image?.src || "");

const canonicalUrl = computed(() => {
  const base = config.public.siteUrl || "https://reprodisseny.com";
  const path = category.value?.seo?.canonical || category.value?.path || route.path;
  return new URL(path, base).toString();
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
}));

useSeoMeta({
  title: () =>
    category.value?.seo?.title ||
    (category.value?.title
      ? `${category.value.title} | Reprodisseny`
      : "Categoría | Reprodisseny"),
  description: () =>
    category.value?.seo?.description ||
    category.value?.description ||
    "Categoría de productos",
  ogTitle: () => category.value?.seo?.title || category.value?.title || "Categoría",
  ogDescription: () =>
    category.value?.seo?.description ||
    category.value?.description ||
    "Categoría de productos",
  ogImage: () => category.value?.seo?.image || heroImage.value || undefined,
  robots: () => category.value?.seo?.robots || "index,follow",
});
</script>

<template>
  <main class="min-h-screen bg-background">
    <div v-if="pending" class="container-content py-16 md:py-20">
      <div
        class="flex min-h-[30vh] items-center justify-center rounded-[28px] border border-border/70 bg-card/70"
      >
        <div class="animate-pulse text-body text-muted-foreground">
          Cargando categoría...
        </div>
      </div>
    </div>

    <template v-else-if="category">
      <div class="container-content pt-4 pb-2 md:pt-6">
        <SiteBreadcrumbs :items="breadcrumbItems" :auto="false" />
      </div>

      <CategoryHero
        :category="category"
        :primary-cta="{ label: 'Pedir presupuesto', to: '/contacto' }"
        :secondary-cta="{ label: 'Ver productos', to: '#productos' }"
      />

      <section
        v-if="children.length"
        class="bg-background"
        aria-labelledby="category-children-heading"
      >
        <div class="container-content py-10 md:py-14">
          <div class="max-w-[760px]">
            <p class="text-label uppercase tracking-[0.08em] text-primary">
              Subcategorías
            </p>
            <h2
              id="category-children-heading"
              class="mt-3 text-[clamp(2rem,2.7vw,2.85rem)] font-bold leading-[1.08] tracking-tight text-foreground"
            >
              Explora esta línea de soluciones
            </h2>
            <p
              class="mt-3 max-w-[68ch] text-body text-foreground/78 md:text-[18px] md:leading-[1.68]"
            >
              Accede directamente a las subcategorías relacionadas con esta área.
            </p>
          </div>

          <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <NuxtLink
              v-for="child in children"
              :key="child.slug || child.path"
              :to="child.path"
              class="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_40px_-26px_hsl(var(--foreground)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
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

      <CategoryContent
        :tabs="tabs"
        :products="products"
        :faqs="faqs"
        :sticky-top="96"
        :rail-scroll-offset="132"
        products-title="Productos de esta categoría"
        products-subtitle="Explora formatos y soluciones relacionadas."
        faq-title="Preguntas frecuentes sobre esta categoría"
        faq-subtitle="Respondemos las dudas más habituales sobre materiales, acabados, formatos y tiempos de producción."
      />

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
    </template>

    <div v-else class="container-content py-16 md:py-20">
      <div class="rounded-[28px] border border-border/70 bg-card p-8 shadow-sm">
        <h1 class="text-[28px] font-semibold leading-[1.2] text-foreground">
          Categoría no encontrada
        </h1>
        <p class="mt-3 max-w-[60ch] text-body text-foreground/72">
          No hemos podido cargar esta categoría.
        </p>
      </div>
    </div>
  </main>
</template>
