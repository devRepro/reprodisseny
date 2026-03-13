<script setup lang="ts">
import { computed } from "vue";
import {
  useSeoMeta,
  useHead,
  useRoute,
  useRouter,
  useAsyncData,
  createError,
} from "#imports";

import PageContainer from "@/components/layout/PageContainer.vue";
import ProductsPageHero from "@/components/marketing/product/PageHero.vue";
import ProductsCategoryRail from "@/components/marketing/product/CategoryRail.vue";
import ProductsFiltersPanel from "@/components/marketing/product/FiltersPanel.vue";
import ProductsToolbar from "@/components/marketing/product/Toolbar.vue";
import ProductsResultsGrid from "@/components/marketing/product/ResultsGrid.vue";
import ProductsEmptyState from "@/components/marketing/product/EmptyState.vue";
import ProductsHelpCta from "@/components/marketing/product/HelpCta.vue";

const route = useRoute();
const router = useRouter();

const perPage = 12;

const page = computed(() => {
  const raw = Number(route.query.page || 1);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
});

const q = computed(() =>
  typeof route.query.q === "string" ? route.query.q.trim() : ""
);

const sort = computed(() =>
  typeof route.query.sort === "string" && route.query.sort
    ? route.query.sort
    : "relevance"
);

const category = computed(() =>
  typeof route.params.category === "string" ? route.params.category.trim().toLowerCase() : ""
);

const catalogKey = computed(() =>
  [
    "products-category-page",
    category.value || "unknown",
    page.value,
    q.value || "",
    sort.value || "relevance",
  ].join(":")
);

const { data, pending, error, refresh } = await useAsyncData(
  "products-category-page",
  () =>
    $fetch("/api/cms/catalog-list", {
      query: {
        mode: "catalog",
        page: page.value,
        perPage,
        category: category.value || undefined,
        q: q.value || undefined,
        sort: sort.value,
      },
    }),
  {
    watch: [page, q, sort, category],
  }
);

const items = computed(() => data.value?.items || []);
const total = computed(() => data.value?.total || 0);
const totalPages = computed(() => data.value?.totalPages || 1);
const categories = computed(() => data.value?.categories || []);

const currentCategoryData = computed(() =>
  categories.value.find((item: any) => {
    const slug =
      typeof item?.slug === "string" ? item.slug.trim().toLowerCase() : "";
    return slug === category.value;
  }) || null
);

const currentCategoryLabel = computed(() => {
  const current = currentCategoryData.value;
  return (
    current?.label ||
    current?.nav ||
    current?.title ||
    category.value
  );
});

if (!pending.value && !error.value && !currentCategoryData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Categoría no encontrada",
  });
}

const canonical = computed(() => {
  const base = `https://reprodisseny.com/${category.value}`;
  return page.value > 1 ? `${base}?page=${page.value}` : base;
});

const shouldNoindex = computed(() => {
  return Boolean(q.value) || sort.value !== "relevance";
});

useSeoMeta({
  title: () => {
    const title = `Catálogo ${currentCategoryLabel.value} | Reprodisseny`;
    return page.value > 1 ? `${title} · Página ${page.value}` : title;
  },
  description: () =>
    `Explora ${currentCategoryLabel.value} en Reprodisseny. Soluciones de impresión profesional y presupuesto online.`,
  ogTitle: () => {
    const title = `Catálogo ${currentCategoryLabel.value} | Reprodisseny`;
    return page.value > 1 ? `${title} · Página ${page.value}` : title;
  },
  ogDescription: () =>
    `Explora ${currentCategoryLabel.value} en Reprodisseny. Soluciones de impresión profesional y presupuesto online.`,
  robots: () => (shouldNoindex.value ? "noindex,follow" : "index,follow"),
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonical.value }],
}));

function updateQuery(nextQuery: string) {
  router.replace({
    path: `/${category.value}`,
    query: {
      ...route.query,
      q: nextQuery?.trim() || undefined,
      page: undefined,
    },
  });
}

function updateSort(nextSort: string) {
  router.replace({
    path: `/${category.value}`,
    query: {
      ...route.query,
      sort: nextSort && nextSort !== "relevance" ? nextSort : undefined,
      page: undefined,
    },
  });
}

function clearFilters() {
  router.push({ path: `/${category.value}` });
}
</script>

<template>
  <main class="min-h-screen bg-white">
    <ProductsPageHero
      :query="q"
      :total="total"
      :category-name="currentCategoryLabel"
      @update:query="updateQuery"
    />

    <nav
      aria-label="Categorías principales"
      class="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md"
    >
      <ProductsCategoryRail
        :categories="categories"
        :selected-category="category"
      />
    </nav>

    <PageContainer>
      <section class="py-8 lg:py-12">
        <div
          v-if="pending"
          class="flex min-h-[400px] flex-col items-center justify-center py-24"
        >
          <div
            class="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
          />
          <p class="mt-4 font-medium text-muted-foreground">
            Actualizando catálogo...
          </p>
        </div>

        <div v-else-if="error" class="mx-auto max-w-md py-20 text-center">
          <div class="mb-4 text-destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 class="text-xl font-bold text-slate-900">
            No pudimos cargar los productos
          </h2>

          <p class="mt-2 mb-6 text-slate-500">
            Hubo un problema de conexión con el servidor.
          </p>

          <button
            @click="refresh()"
            class="rounded-lg bg-primary px-6 py-2 text-white shadow-sm transition-all hover:bg-primary/90"
          >
            Reintentar ahora
          </button>
        </div>

        <div v-else class="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside class="hidden lg:block">
            <div
              class="custom-scrollbar sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-4"
            >
              <h3 class="mb-6 text-sm font-bold uppercase tracking-wider text-slate-400">
                Filtrar por
              </h3>

              <ProductsFiltersPanel
                :categories="categories"
                :selected-category="category"
                :base-path="'/'"
                @clear="clearFilters"
              />
            </div>
          </aside>

          <div
            class="flex flex-col gap-6"
            role="region"
            aria-label="Resultados del catálogo"
          >
            <ProductsToolbar
              :sort="sort"
              :results-count="items.length"
              :total-count="total"
              @update:sort="updateSort"
            />

            <div class="min-h-[600px]">
              <ProductsResultsGrid
                v-if="items.length"
                :key="catalogKey"
                :products="items"
                :page="page"
                :total-pages="totalPages"
                :total="total"
                :base-path="`/${category}`"
                class="animate-in fade-in duration-700"
              />

              <ProductsEmptyState v-else @clear="clearFilters" />
            </div>
          </div>
        </div>
      </section>
    </PageContainer>

    <ProductsHelpCta class="mt-12" />
  </main>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #e2e8f0;
}
</style>