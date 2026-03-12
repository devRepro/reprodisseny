<script setup lang="ts">
import { computed } from "vue";
import type { ProductListItem } from "@/types/product";
import ProductResultCard from "@/components/marketing/product/ResultCard.vue";

const props = withDefaults(
  defineProps<{
    products?: ProductListItem[];
  }>(),
  {
    products: () => [],
  }
);

const safeProducts = computed(() =>
  (props.products || []).filter(
    (p): p is ProductListItem =>
      Boolean(p && typeof p === "object" && p.slug && p.title)
  )
);
</script>

<template>
  <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
    <ProductResultCard
      v-for="product in safeProducts"
      :key="product.slug"
      :product="product"
    />
  </div>
</template>