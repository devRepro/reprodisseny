<script setup lang="ts">
import { computed } from "vue";
import type { CategoryDetailPageDto } from "~/server/services/cms/catalog.service";
import SiteBreadcrumbs from "@/components/shared/SiteBreadcrumbs.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";

const route = useRoute();
const config = useRuntimeConfig();

function isAssetLike(v: unknown) {
  const s = String(v ?? "").trim();
  return /^(img|_nuxt)\//i.test(s) || /\.(jpg|jpeg|png|webp|avif|gif|svg|pdf)$/i.test(s);
}

const slug = computed(() => {
  const raw = route.params.slug;
  const parts = Array.isArray(raw)
    ? raw
    : String(raw ?? "")
        .split(/[\/,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

  return parts.join("/");
});

if (isAssetLike(slug.value)) {
  throw createError({
    statusCode: 404,
    message: `Ruta estática inválida para CMS: ${slug.value}`,
  });
}

const { data, pending, error } = await useAsyncData<CategoryDetailPageDto>(
  () => `cms:category:${slug.value}`,
  () => $fetch(`/api/cms/category/${slug.value}`),
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
    (category.value?.title ? `${category.value.title} | Reprodisseny` : "Categoría | Reprodisseny"),
  description: () =>
    category.value?.seo?.description || category.value?.description || "Categoría de productos",
  ogTitle: () =>
    category.value?.seo?.title || category.value?.title || "Categoría",
  ogDescription: () =>
    category.value?.seo?.description || category.value?.description || "Categoría de productos",
  ogImage: () => category.value?.seo?.image || heroImage.value || undefined,
  robots: () => category.value?.seo?.robots || "index,follow",
});
</script>

<template>
  <main class="min-h-screen bg-background">
    <nav class="border-b border-border bg-background/60">
      <div class="container-wide py-4">
        <SiteBreadcrumbs :items="breadcrumbItems" :auto="false" />
      </div>
    </nav>

    <div v-if="pending" class="flex min-h-[40vh] items-center justify-center">
      <div class="animate-pulse font-medium text-muted-foreground">
        Cargando categoría...
      </div>
    </div>

    <template v-else-if="category">
      <section class="container-wide py-10 md:py-14">
        <div class="grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-center">
          <div>
            <p class="mb-3 text-sm font-medium uppercase tracking-wide text-primary">
              Categoría
            </p>

            <h1 class="text-4xl font-bold tracking-tight md:text-5xl">
              {{ category.title }}
            </h1>

            <p
              v-if="category.description"
              class="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg"
            >
              {{ category.description }}
            </p>
          </div>

          <div v-if="heroImage" class="overflow-hidden rounded-2xl border bg-muted/20">
            <img
              :src="heroImage"
              :alt="category.image?.alt || category.title || 'Categoría'"
              class="h-full max-h-[360px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section v-if="children.length" class="container-wide py-6 md:py-10">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 class="text-2xl font-semibold md:text-3xl">Subcategorías</h2>
            <p class="mt-2 text-muted-foreground">
              Explora las líneas de producto dentro de esta categoría.
            </p>
          </div>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <NuxtLink
            v-for="child in children"
            :key="child.slug || child.path"
            :to="child.path"
            class="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div class="aspect-[16/10] overflow-hidden bg-muted/30">
              <img
                v-if="child.image?.src"
                :src="child.image.src"
                :alt="child.image.alt || child.title || 'Subcategoría'"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              <div v-else class="h-full w-full bg-muted/40" />
            </div>

            <div class="p-5">
              <h3 class="text-lg font-semibold">
                {{ child.title }}
              </h3>

              <p
                v-if="child.description"
                class="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground"
              >
                {{ child.description }}
              </p>

              <div class="mt-4 text-sm font-medium text-primary">Ver subcategoría</div>
            </div>
          </NuxtLink>
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

      <section v-if="products.length" class="container-wide py-12 md:py-16">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 class="text-2xl font-semibold md:text-3xl">Productos</h2>
            <p class="mt-2 text-muted-foreground">
              Selección de productos disponibles en esta categoría.
            </p>
          </div>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <NuxtLink
            v-for="product in products"
            :key="product.slug || product.path"
            :to="product.path"
            class="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div class="aspect-[4/3] overflow-hidden bg-muted/30">
              <img
                v-if="product.image?.src"
                :src="product.image.src"
                :alt="product.image.alt || product.title || 'Producto'"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              <div v-else class="h-full w-full bg-muted/40" />
            </div>

            <div class="p-5">
              <h3 class="text-base font-semibold">
                {{ product.title }}
              </h3>

              <p
                v-if="product.description"
                class="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground"
              >
                {{ product.description }}
              </p>

              <div class="mt-4 text-sm font-medium text-primary">Ver producto</div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <section
        v-if="tabs.length"
        class="border-y border-border bg-muted/20 py-14 md:py-20"
      >
        <div class="container-wide">
          <div class="mx-auto max-w-[980px]">
            <h2 class="mb-8 text-center text-2xl font-semibold md:text-3xl">
              Información adicional
            </h2>

            <div class="space-y-6">
              <article
                v-for="tab in tabs"
                :key="tab.id"
                class="rounded-2xl border bg-background p-6"
              >
                <h3 class="text-lg font-semibold">
                  {{ tab.title }}
                </h3>

                <div
                  v-if="tab.html"
                  class="prose prose-neutral mt-3 max-w-none"
                  v-html="tab.html"
                />

                <p
                  v-else-if="tab.text"
                  class="mt-3 whitespace-pre-line leading-7 text-muted-foreground"
                >
                  {{ tab.text }}
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="container-wide py-16">
      <div class="rounded-2xl border bg-card p-8">
        <h1 class="text-2xl font-semibold">Categoría no encontrada</h1>
        <p class="mt-3 text-muted-foreground">No hemos podido cargar esta categoría.</p>
      </div>
    </div>
  </main>
</template>