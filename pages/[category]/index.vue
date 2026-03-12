<script setup lang="ts">
import { computed } from "vue"
import ProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue"

type CatalogRes = any

const { data, pending, error } = await useAsyncData<CatalogRes>(
  "catalog:nav",
  () => $fetch("/api/cms/catalog", { params: { mode: "nav", includeProducts: 0 } }),
  { server: true }
)

const tree = computed<any[]>(() => {
  const v: any = data.value
  return Array.isArray(v) ? v : v?.tree || v?.data?.tree || []
})

const categoryCards = computed(() =>
  tree.value
    .filter((c) => !c?.hidden)
    .map((c) => ({
      title: c.nav || c.title,
      to: c.path || `/categorias/${c.slug}`,
      imageSrc: c.image || c.imageSrc || null,
    }))
)
</script>

<template>
  <main class="mx-auto max-w-7xl px-6 py-10">
    <h1 class="text-2xl font-semibold">Categorías</h1>

    <div v-if="pending" class="py-10">Cargando…</div>
    <div v-else-if="error" class="py-10">No se han podido cargar las categorías.</div>
    <ProductCategoryGrid v-else :categorias="categoryCards" />
  </main>
</template>
