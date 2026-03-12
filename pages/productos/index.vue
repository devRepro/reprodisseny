<script setup lang="ts">
import { watchEffect } from "vue";
import { useProductsCatalog } from "@/composables/useProductsCatalog";

import SectionStack from "@/components/layout/SectionStack.vue";
import PageContainer from "@/components/layout/PageContainer.vue";
import ProductsPageHero from "@/components/marketing/product/PageHero.vue";
import ProductsCategoryRail from "@/components/marketing/product/CategoryRail.vue";
import ProductsFiltersPanel from "@/components/marketing/product/FiltersPanel.vue";
import ProductsToolbar from "@/components/marketing/product/Toolbar.vue";
import ProductsResultsGrid from "@/components/marketing/product/ResultsGrid.vue";
import ProductsEmptyState from "@/components/marketing/product/EmptyState.vue";
import ProductsHelpCta from "@/components/marketing/product/HelpCta.vue";

function extractProducts(payload: any) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

const {
  products,
  categories,
  query,
  selectedCategory,
  sort,
  filteredProducts,
  totalProducts,
  setProducts,
  clearFilters,
} = useProductsCatalog();

const { data, pending, error } = await useAsyncData(
  "products-catalog",
  () =>
    $fetch("/api/cms/catalog", {
      query: {
        mode: "catalog",
        includeProducts: 1,
        productLimit: 500,
        refresh: 1,
      },
    })
);

watchEffect(() => {
  const items = extractProducts(data.value);
  setProducts(items);
});

watchEffect(() => {
  console.log(
    "[CATALOG] products snapshot",
    products.value.map((p, i) => ({
      i,
      ok: !!p,
      slug: p?.slug,
      title: p?.title,
    }))
  );
});
</script>

<template>
  <main>
    <SectionStack gap="normal">
      <ProductsPageHero
        v-model:query="query"
        :total="filteredProducts.length"
      />

      <ProductsCategoryRail
        :categories="categories"
        :selected-category="selectedCategory"
        @select-category="selectedCategory = $event"
      />

      <PageContainer>
        <section class="py-8">
          <div v-if="pending" class="text-sm text-muted-foreground">
            Cargando productos…
          </div>

          <div v-else-if="error" class="text-sm text-destructive">
            No se ha podido cargar el catálogo.
          </div>

          <div v-else class="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside class="hidden lg:block">
              <ProductsFiltersPanel
                v-model:selected-category="selectedCategory"
                :categories="categories"
                @clear="clearFilters"
              />
            </aside>

            <div class="min-w-0">
              <ProductsToolbar
                v-model:query="query"
                v-model:sort="sort"
                :results-count="filteredProducts.length"
                :total-count="totalProducts"
              />

              <ProductsResultsGrid
                v-if="filteredProducts.length"
                :products="filteredProducts"
              />

              <ProductsEmptyState
                v-else
                @clear="clearFilters"
              />
            </div>
          </div>
        </section>
      </PageContainer>

      <ProductsHelpCta />
    </SectionStack>
  </main>
</template>