<template>
  <section v-if="products?.length" class="mt-16">
    <h2 id="productos-heading" class="text-2xl font-bold mb-8 text-foreground">
      Productos
    </h2>
    <ul class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="p in products" :key="p.path">
        <ProductCard :product="p" />
      </li>
    </ul>
  </section>

  <!-- Estado vacío opcional -->
  <section v-else class="mt-16 text-sm text-muted-foreground text-center">
    No hay productos para mostrar.
  </section>
</template>

<script setup lang="ts">
import type { ProductListItem } from "@/types";

defineProps<{ products: ProductListItem[] }>();
</script>
