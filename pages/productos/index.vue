<script setup lang="ts">
import { computed } from "vue";
import { useSeoMeta, useHead, useRoute, useRouter, useAsyncData } from "#imports";

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
const basePath = "/productos";

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

const selectedCategory = computed(() =>
  typeof route.query.category === "string"
    ? route.query.category.trim().toLowerCase()
    : ""
);

const catalogKey = computed(() =>
  [
    "products-catalog",
    selectedCategory.value || "all",
    page.value,
    q.value || "",
    sort.value,
  ].join(":")
);

const { data, pending, error, refresh } = await useAsyncData(
  () => catalogKey.value,
  () =>
    $fetch("/api/cms/catalog-list", {
      query: {
        page: page.value,
        perPage,
        q: q.value || undefined,
        sort: sort.value,
        category: selectedCategory.value || undefined,
      },
    }),
  {
    watch: [page, q, sort, selectedCategory],
  }
);

const items = computed(() => data.value?.items || []);
const total = computed(() => data.value?.total || 0);
const totalPages = computed(() => data.value?.totalPages || 1);
const categories = computed(() => data.value?.categories || []);

const currentCategoryLabel = computed(() => {
  const match = categories.value.find(
    (item: any) => String(item?.slug || "").trim().toLowerCase() === selectedCategory.value
  );

  return match?.label || match?.nav || match?.title || "";
});

const canonical = computed(() => {
  const url = new URL(`https://reprodisseny.com${basePath}`);

  if (selectedCategory.value) url.searchParams.set("category", selectedCategory.value);
  if (page.value > 1) url.searchParams.set("page", String(page.value));

  return url.toString();
});

const shouldNoindex = computed(() => {
  return Boolean(q.value) || sort.value !== "relevance" || Boolean(selectedCategory.value);
});

useSeoMeta({
  title: () =>
    selectedCategory.value
      ? `Catálogo ${currentCategoryLabel.value || selectedCategory.value} | Reprodisseny`
      : "Catálogo de productos | Reprodisseny",

  description:
    "Encuentra el soporte o formato que necesitas: adhesivos, gran formato, expositores y más. Solicita presupuesto online.",

  ogTitle: () =>
    selectedCategory.value
      ? `Catálogo ${currentCategoryLabel.value || selectedCategory.value} | Reprodisseny`
      : "Catálogo de productos | Reprodisseny",

  ogDescription:
    "Soluciones de impresión profesional para empresas, retail, eventos y espacios corporativos.",

  robots: () => (shouldNoindex.value ? "noindex,follow" : "index,follow"),
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonical.value }],
}));

function updateQuery(nextQuery: string) {
  router.replace({
    path: basePath,
    query: {
      ...route.query,
      q: nextQuery?.trim() || undefined,
      page: undefined,
    },
  });
}

function updateSort(nextSort: string) {
  router.replace({
    path: basePath,
    query: {
      ...route.query,
      sort: nextSort && nextSort !== "relevance" ? nextSort : undefined,
      page: undefined,
    },
  });
}

function updateCategoryFilter(nextCategory: string | null) {
  router.replace({
    path: basePath,
    query: {
      ...route.query,
      category: nextCategory || undefined,
      page: undefined,
    },
  });
}

function clearFilters() {
  router.push({
    path: basePath,
    query: {
      q: undefined,
      sort: undefined,
      category: undefined,
      page: undefined,
    },
  });
}
</script>

<template>
  <main class="min-h-screen bg-background">
    <ProductsPageHero
      :query="q"
      :total="total"
      :category-name="currentCategoryLabel"
      @update:query="updateQuery"
    />

    <nav
      aria-label="Categorías principales"
      class="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md"
    >
      <ProductsCategoryRail
        :categories="categories"
        :selected-category="selectedCategory"
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
          <h2 class="text-xl font-bold text-foreground">
            No pudimos cargar los productos
          </h2>

          <p class="mt-2 mb-6 text-muted-foreground">
            Hubo un problema de conexión con el servidor.
          </p>

          <button
            @click="refresh()"
            class="rounded-lg bg-primary px-6 py-2 text-primary-foreground shadow-sm transition-all hover:opacity-90"
          >
            Reintentar ahora
          </button>
        </div>

        <div v-else class="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside class="hidden lg:block">
            <div
              class="custom-scrollbar sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-4"
            >
              <h3 class="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Filtrar por
              </h3>

              <ProductsFiltersPanel
                :categories="categories"
                :selected-category="selectedCategory"
                @update:selected-category="updateCategoryFilter"
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
              :page="page"
              :per-page="perPage"
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
                :base-path="basePath"
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