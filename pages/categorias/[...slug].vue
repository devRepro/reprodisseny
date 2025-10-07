<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAsyncData } from "#app";
import { computed } from "vue";

definePageMeta({ layout: "categoria" });

const route = useRoute();
const routeSlug = computed(() => {
  const p = route.params.slug;
  const s = Array.isArray(p) ? p.join("/") : String(p || "");
  return s.replace(/^\/+|\/+$/g, "");
});

// Categoría
const { data: catDoc, pending: pendingCat, error: errorCat } = await useAsyncData(
  () => `cat:doc:${routeSlug.value}`,
  () => queryCollection("categorias").path(`/categorias/${routeSlug.value}`).first()
);

// Productos
const { data: prodData, pending: pendingProd, error: errorProd } = await useAsyncData(
  () => `cat:products:${routeSlug.value}`,
  () =>
    queryCollection("productos")
      .where("categorySlug", "=", routeSlug.value)
      .order("order", "ASC")
      .all()
);

const productsArr = computed(() => prodData.value ?? []);
</script>

<template>
  <!-- Migas dentro de la página (evita #navigation para no tener dos <template>) -->
  <div class="bg-white border-b">
    <div class="container mx-auto px-4">
      <!-- OJO al nombre auto-importado: share/bread/Crumbs.vue -> <ShareBreadCrumbs /> -->
      <SharedBreadCrumbs />
    </div>
  </div>

  <main class="container mx-auto px-4 py-8 space-y-10">
    <div v-if="pendingCat">Cargando...</div>
    <div v-else-if="errorCat">Error...</div>
    <div v-else-if="!catDoc">No encontrado...</div>

    <div v-else>
      <section class="categoria-hero flex flex-col md:flex-row items-center gap-6">
        <div class="flex-1">
          <h1 class="text-3xl font-bold">{{ catDoc.title }}</h1>
          <p class="mt-2 text-gray-600">{{ catDoc.description }}</p>
        </div>
        <div class="w-full md:w-1/3">
          <!-- si usas NuxtImg, mejor loading="lazy" -->
          <!-- <NuxtImg v-if="catDoc.image" :src="catDoc.image" :alt="catDoc.title" class="rounded-lg object-cover w-full h-auto" loading="lazy" /> -->
        </div>
      </section>

      <!-- …tu resto de secciones… -->
    </div>
  </main>
</template>
