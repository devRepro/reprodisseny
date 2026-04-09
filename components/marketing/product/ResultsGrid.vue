<script setup lang="ts">
import { computed } from "vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";

type ProductImage =
  | string
  | {
      src?: string;
      alt?: string;
    }
  | null
  | undefined;

type ProductItem = {
  id?: string | number;
  slug?: string;
  path?: string;
  title?: string;
  description?: string;
  excerpt?: string;
  summary?: string;
  image?: ProductImage;
  categoryTitle?: string;
  categoryName?: string;
};

const props = withDefaults(
  defineProps<{
    products?: ProductItem[];
    page?: number;
    totalPages?: number;
    total?: number;
    basePath?: string;
  }>(),
  {
    products: () => [],
    page: 1,
    totalPages: 1,
    total: 0,
    basePath: "/productos",
  }
);

const route = useRoute();

const safePage = computed(() => {
  const value = Number(props.page || 1);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
});

const safeTotalPages = computed(() => {
  const value = Number(props.totalPages || 1);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
});

const safeProducts = computed(() =>
  Array.isArray(props.products) ? props.products.filter(Boolean) : []
);

function getProductHref(product: ProductItem) {
  const directPath = String(product?.path || "").trim();
  if (directPath) return directPath;

  const slug = String(product?.slug || "").trim();
  if (slug) return `${props.basePath.replace(/\/+$/, "")}/${slug}`;

  return props.basePath;
}

function getProductTitle(product: ProductItem) {
  return String(product?.title || "Producto").trim();
}

function getProductDescription(product: ProductItem) {
  return (
    String(product?.description || "").trim() ||
    String(product?.excerpt || "").trim() ||
    String(product?.summary || "").trim()
  );
}

function getProductCategory(product: ProductItem) {
  return (
    String(product?.categoryTitle || "").trim() ||
    String(product?.categoryName || "").trim()
  );
}

function getImageSrc(product: ProductItem) {
  const image = product?.image;

  if (typeof image === "string") {
    return normalizeCmsMediaSrc(image) || image;
  }

  const src = String(image?.src || "").trim();
  if (!src) return "";

  return normalizeCmsMediaSrc(src) || src;
}

function getImageAlt(product: ProductItem) {
  if (typeof product?.image === "object" && product?.image?.alt) {
    return String(product.image.alt).trim();
  }

  return getProductTitle(product);
}

const paginationPages = computed(() => {
  const total = safeTotalPages.value;
  const current = safePage.value;

  if (total <= 1) return [];

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);

  for (let i = current - 1; i <= current + 1; i += 1) {
    if (i > 1 && i < total) pages.add(i);
  }

  return Array.from(pages).sort((a, b) => a - b);
});

function buildPageLocation(targetPage: number) {
  return {
    path: props.basePath,
    query: {
      ...route.query,
      page: targetPage > 1 ? String(targetPage) : undefined,
    },
  };
}
</script>

<template>
  <div class="space-y-8">
    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="product in safeProducts"
        :key="product.id || product.slug || product.path || getProductTitle(product)"
        class="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_40px_-26px_hsl(var(--foreground)/0.18)]"
      >
        <NuxtLink
          :to="getProductHref(product)"
          class="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
        >
          <div class="aspect-[4/3] overflow-hidden bg-muted/25">
            <NuxtImg
              v-if="getImageSrc(product)"
              :src="getImageSrc(product)"
              :alt="getImageAlt(product)"
              width="640"
              height="480"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div v-else class="h-full w-full bg-muted/40" />
          </div>

          <div class="flex flex-1 flex-col px-5 py-5">
            <p
              v-if="getProductCategory(product)"
              class="text-xs font-semibold uppercase tracking-[0.14em] text-primary/75"
            >
              {{ getProductCategory(product) }}
            </p>

            <h3 class="mt-2 text-[20px] font-semibold leading-[1.25] text-foreground">
              {{ getProductTitle(product) }}
            </h3>

            <p
              v-if="getProductDescription(product)"
              class="mt-3 line-clamp-3 text-body-s leading-[1.6] text-foreground/72"
            >
              {{ getProductDescription(product) }}
            </p>

            <span
              class="mt-5 inline-flex min-h-11 items-center justify-center self-start rounded-lg border border-border bg-background px-4 py-2.5 text-body-s-bold text-foreground transition group-hover:border-primary/25 group-hover:text-primary"
            >
              Ver producto
            </span>
          </div>
        </NuxtLink>
      </article>
    </div>

    <nav
      v-if="safeTotalPages > 1"
      class="flex flex-wrap items-center justify-center gap-2 pt-2"
      aria-label="Paginación de productos"
    >
      <NuxtLink
        v-if="safePage > 1"
        :to="buildPageLocation(safePage - 1)"
        class="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/25 hover:text-primary"
      >
        Anterior
      </NuxtLink>

      <template v-for="(p, index) in paginationPages" :key="`page-${p}`">
        <span
          v-if="index > 0 && paginationPages[index - 1] !== p - 1"
          class="px-2 text-sm text-muted-foreground"
          aria-hidden="true"
        >
          …
        </span>

        <NuxtLink
          :to="buildPageLocation(p)"
          class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition"
          :class="
            p === safePage
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-foreground hover:border-primary/25 hover:text-primary'
          "
          :aria-current="p === safePage ? 'page' : undefined"
        >
          {{ p }}
        </NuxtLink>
      </template>

      <NuxtLink
        v-if="safePage < safeTotalPages"
        :to="buildPageLocation(safePage + 1)"
        class="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/25 hover:text-primary"
      >
        Siguiente
      </NuxtLink>
    </nav>
  </div>
</template>