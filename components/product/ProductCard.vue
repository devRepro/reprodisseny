<script setup lang="ts">
import type { ProductListItem } from "@/types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { NuxtImg } from "#components";

const props = defineProps<{ product: ProductListItem }>();
const src = props.product.image || "/img/productos/fallback.webp";
</script>

<template>
  <NuxtLink
    :to="product.path"
    class="group block rounded-xl hover:shadow-lg transition-shadow"
    prefetch
  >
    <Card
      class="h-full overflow-hidden flex flex-col bg-white dark:bg-muted border border-border shadow-sm"
    >
      <CardHeader class="p-0">
        <NuxtImg
          :src="src"
          :alt="product.alt || product.title || 'Producto'"
          width="400"
          height="267"
          format="webp"
          class="w-full h-full object-cover aspect-[3/2]"
        />
      </CardHeader>
      <CardContent class="p-4">
        <CardTitle class="text-base">{{ product.title }}</CardTitle>
        <p
          v-if="product.description"
          class="text-sm text-muted-foreground line-clamp-2 mt-1"
        >
          {{ product.description }}
        </p>
      </CardContent>
    </Card>
  </NuxtLink>
</template>
