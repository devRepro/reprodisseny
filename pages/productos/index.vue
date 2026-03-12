<script setup lang="ts">
import { useProductsCatalog } from "@/composables/useProductsCatalog";
import SectionStack from "@/components/layout/SectionStack.vue";
import ProductsPageHero from "@/components/marketing/product/PageHero.vue";
import ProductsCategoryRail from "@/components/marketing/product/CategoryRail.vue";
import FeatureBand from "@/components/marketing/FeatureBand.vue";
import PageContainer from "@/components/layout/PageContainer.vue";
import ProductsFiltersPanel from "@/components/marketing/product/FiltersPanel.vue";
import ProductsToolbar from "@/components/marketing/product/Toolbar.vue";
import ProductsResultsGrid from "@/components/marketing/product/ResultsGrid.vue";
import ProductsEmptyState from "@/components/marketing/product/EmptyState.vue";
import ProductsHelpCta from "@/components/marketing/product/HelpCta.vue";

const {
  products,
  categories,
  query,
  selectedCategory,
  sort,
  filteredProducts,
  totalProducts,
  clearFilters,
} = useProductsCatalog();
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

      <FeatureBand />

      <PageContainer>
        <section class="py-8 md:py-10 lg:py-12">
          <div class="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
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