<script setup lang="ts">
import { computed } from "vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
import CmsImage from "@/components/shared/blocks/CmsImage.vue";
import AppButton from "@/components/shared/button/AppButton.vue";

type ProductImage =
  | string
  | {
      src?: string;
      alt?: string;
    }
  | null
  | undefined;

type ProductAttribute = {
  key?: string;
  label?: string;
  value?: string;
  icon?: string;
  tone?: string;
};

type ProductItem = {
  id?: string | number;
  slug?: string;
  path?: string;
  href?: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  excerpt?: string;
  summary?: string;
  image?: ProductImage;
  categoryTitle?: string;
  categoryLabel?: string;
  categoryName?: string;
  tags?: string[];
  attributes?: ProductAttribute[];
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
  const directPath = String(product?.href || product?.path || "").trim();
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
    String(product?.shortDescription || "").trim() ||
    String(product?.description || "").trim() ||
    String(product?.excerpt || "").trim() ||
    String(product?.summary || "").trim()
  );
}

function getProductCategory(product: ProductItem) {
  return (
    String(product?.categoryLabel || "").trim() ||
    String(product?.categoryTitle || "").trim() ||
    String(product?.categoryName || "").trim()
  );
}

function getProductTags(product: ProductItem) {
  const tagCandidates = [
    ...(Array.isArray(product?.tags) ? product.tags : []),
    ...(Array.isArray(product?.attributes)
      ? product.attributes.map((attribute) => attribute?.label || attribute?.value)
      : []),
  ];

  const seen = new Set<string>();

  return tagCandidates
    .map((tag) => String(tag || "").trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
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
    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="product in safeProducts"
        :key="product.id || product.slug || product.path || getProductTitle(product)"
        class="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
      >
        <NuxtLink
          :to="getProductHref(product)"
          class="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
        >
          <div class="relative aspect-[4/3] overflow-hidden bg-muted/25">
            <CmsImage
              v-if="getImageSrc(product)"
              :src="getImageSrc(product)"
              :alt="getImageAlt(product)"
              width="640"
              height="480"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />

            <div v-else class="h-full w-full bg-muted/40" />

            <div v-if="getProductCategory(product)" class="absolute left-4 top-4">
              <span
                class="inline-flex items-center rounded-full border border-white/50 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary shadow-sm backdrop-blur"
              >
                {{ getProductCategory(product) }}
              </span>
            </div>
          </div>
        </NuxtLink>

        <div class="flex flex-1 flex-col p-5 md:p-6">
          <NuxtLink :to="getProductHref(product)" class="group/title">
            <h3
              class="text-[20px] font-semibold leading-tight text-foreground transition group-hover/title:text-primary"
            >
              {{ getProductTitle(product) }}
            </h3>
          </NuxtLink>

          <p
            v-if="getProductDescription(product)"
            class="mt-3 line-clamp-3 text-body-s leading-[1.6] text-foreground/72"
          >
            {{ getProductDescription(product) }}
          </p>

          <div v-if="getProductTags(product).length" class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="tag in getProductTags(product)"
              :key="tag"
              class="inline-flex items-center rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground/65"
            >
              {{ tag }}
            </span>
          </div>

          <div class="mt-auto pt-6">
            <AppButton :to="getProductHref(product)" variant="outline" size="sm" arrow>
              Ver producto
            </AppButton>
          </div>
        </div>
      </article>
    </div>

    <nav
      v-if="safeTotalPages > 1"
      class="flex flex-wrap items-center justify-center gap-2 pt-2"
      aria-label="Paginación de productos"
    >
      <AppButton
        v-if="safePage > 1"
        :to="buildPageLocation(safePage - 1)"
        variant="outline"
        size="sm"
      >
        Anterior
      </AppButton>

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
          class="inline-flex min-h-9 min-w-9 items-center justify-center rounded-2xl border px-3 py-2 text-sm font-semibold transition"
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

      <AppButton
        v-if="safePage < safeTotalPages"
        :to="buildPageLocation(safePage + 1)"
        variant="outline"
        size="sm"
      >
        Siguiente
      </AppButton>
    </nav>
  </div>
</template>
