<!-- components/shared/viewCard/ProductCard.vue -->
<template>
  <Card class="h-full flex flex-col group hover:shadow-lg transition">
    <CardHeader class="p-0">
      <NuxtLink :to="path" class="block overflow-hidden">
        <NuxtImg
          :src="product.image"
          :alt="product.title"
          class="w-full h-48 object-cover transition-transform group-hover:scale-105"
          width="400"
          height="300"
          lazy
        />
      </NuxtLink>
    </CardHeader>
    <CardContent class="p-4 flex-1">
      <h3 class="text-lg font-semibold mb-1">
        <NuxtLink :to="path">
          {{ product.title }}
        </NuxtLink>
      </h3>
      <p class="text-sm text-gray-500 line-clamp-2">{{ product.excerpt }}</p>
    </CardContent>
    <CardFooter class="p-4">
      <div class="flex items-center justify-between">
        <span class="text-lg font-bold">{{ formatPrice(product.price) }}</span>
        <NuxtLink :to="path" class="text-primary hover:underline">Ver más</NuxtLink>
      </div>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { NuxtImg } from "#components";
import { useRuntimeConfig } from "#imports";

const props = defineProps<{
  product: any;
}>();

const product = props.product;

// construir la ruta de producto
const path = product.path || `/productos/${product.slug}`;

// función formateo de precio (puedes adaptarla)
function formatPrice(p: number | string | undefined) {
  if (p == null) return "";
  return p.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
</script>

<style scoped>
/* opcional: límites, sombras, etc. */
</style>
