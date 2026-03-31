<script setup lang="ts">
import { computed } from "vue";
import CatalogGrid from "@/components/shared/catalog/CatalogGrid.vue";
import CategoryCard from "@/components/marketing/category/CategoryCard.vue";
import ProductCard from "@/components/marketing/product/ProductCard.vue";

type CategoryLike = {
  slug?: string | null;
  path?: string | null;
  title?: string | null;
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  excerpt?: string | null;
  image?: unknown;
  imageSrc?: string | null;
  hero?: {
    image?: unknown;
  } | null;
};

type ProductLike = {
  slug?: string | null;
  path?: string | null;
  title?: string | null;
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  excerpt?: string | null;
  image?: unknown;
  imageSrc?: string | null;
};

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title?: string;
    description?: string;
    categories?: CategoryLike[];
    products?: ProductLike[];
    maxColumns?: 2 | 3 | 4;
  }>(),
  {
    eyebrow: "",
    title: "Productos de esta categoría",
    description: "Explora formatos y soluciones relacionadas.",
    categories: () => [],
    products: () => [],
    maxColumns: 3,
  }
);

const visibleCategories = computed(() =>
  (props.categories ?? []).filter(
    (item) => Boolean(item?.title || item?.name) && Boolean(item?.path || item?.slug)
  )
);

const visibleProducts = computed(() =>
  (props.products ?? []).filter(
    (item) => Boolean(item?.title || item?.name) && Boolean(item?.path || item?.slug)
  )
);

const hasContent = computed(
  () => visibleCategories.value.length > 0 || visibleProducts.value.length > 0
);
</script>

<template>
  <section v-if="hasContent" class="container-content py-16 md:py-20">
    <div class="space-y-8 md:space-y-10">
      <header class="max-w-3xl space-y-3">
        <p v-if="eyebrow" class="text-sm font-semibold text-primary">
          {{ eyebrow }}
        </p>

        <h2 class="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {{ title }}
        </h2>

        <p
          v-if="description"
          class="text-base leading-7 text-muted-foreground"
        >
          {{ description }}
        </p>
      </header>

      <div v-if="visibleCategories.length" class="space-y-6">
        <CatalogGrid :max-columns="maxColumns">
          <CategoryCard
            v-for="category in visibleCategories"
            :key="category.path || category.slug || category.title || category.name"
            :category="category"
          />
        </CatalogGrid>
      </div>

      <div v-if="visibleProducts.length" class="space-y-6">
        <CatalogGrid :max-columns="maxColumns">
          <ProductCard
            v-for="product in visibleProducts"
            :key="product.path || product.slug || product.title || product.name"
            :product="product"
          />
        </CatalogGrid>
      </div>
    </div>
  </section>
</template>
