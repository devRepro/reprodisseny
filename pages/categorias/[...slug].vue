<!-- pages/categorias/[...slug].vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAsyncData } from "#app";

const route = useRoute();
const routeSlug = computed(() => {
  const p = route.params.slug;
  const s = Array.isArray(p) ? p.join("/") : String(p || "");
  return s.replace(/^\/+|\/+$/g, "");
});

// último segmento (subcategoría si hay jerarquía)
const subSlug = computed(() => {
  const parts = routeSlug.value.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
});

// doc de la categoría/subcategoría
const { data: catDoc } = await useAsyncData(
  () => `cat:doc:${routeSlug.value}`,
  // @ts-expect-error auto-import
  () => queryCollection("categorias").path(`/categorias/${routeSlug.value}`).first()
);

// productos de la subcategoría (subcategorySlug = último segmento)
const { data: prodData, pending: pendingProd, error: errorProd } = await useAsyncData(
  () => `cat:products:${routeSlug.value}`,
  // @ts-expect-error auto-import
  () =>
    queryCollection("productos")
      .where("subcategorySlug", "=", subSlug.value) // clave
      .order("order", "ASC")
      .all()
);

const products = computed(() => prodData.value ?? []);
</script>

<template>
  <main class="container mx-auto px-4 py-8 space-y-8">
    <h1 class="text-3xl font-bold">{{ catDoc?.title || subSlug }}</h1>

    <div v-if="pendingProd">Cargando productos…</div>
    <div v-else-if="errorProd" class="text-red-600">Error: {{ errorProd.message }}</div>
    <div v-else>
      <div
        v-if="products.length"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <SharedViewCard v-for="p in products" :key="p.slug || p.id" :product="p" />
      </div>
      <div v-else class="text-sm text-muted-foreground">
        No hay productos para esta subcategoría.
      </div>
    </div>
  </main>
</template>
