<script setup lang="ts">
import type { Product } from "@/types/product";

defineProps<{
  products: Product[];
}>();
</script>

<template>
  <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
    <ProductResultCard
      v-for="product in products"
      :key="product.slug"
      :product="product"
    />
  </div>
</template>