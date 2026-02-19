<script setup lang="ts">
import { computed } from "vue";

import QuoteHero from "@/components/marketing/quote/QuoteHero.vue";
import QuoteFormSection from "@/components/marketing/quote/FormSection.vue";

import ContactInfoBand from "@/components/marketing/ContactInfoBand.vue";
import ProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";

const { data: categories } = await useAsyncData(
  "quoteCategories",
  () => $fetch("/api/cms/catalog", { params: { mode: "nav" } }),
  { default: () => [] }
);

const categoryCards = computed(() => {
  const list = Array.isArray(categories.value)
    ? categories.value
    : categories.value?.categories ?? categories.value?.tree ?? [];
  return list.map((c: any) => ({
    title: c.nav || c.title || "",
    to: c.path || (c.slug ? `/categorias/${c.slug}` : "/categorias"),
    imageSrc: c.image || c.imageSrc || "",
  }));
});
</script>

<template>
  <div>
    <QuoteHero />
    <QuoteFormSection submit-endpoint="/api/price-requests" />

    <ContactInfoBand />

    <ProductCategoryGrid
      title="Si buscas algo específico puedes explorar nuestras categorías de producto"
      :categorias="categoryCards"
    />

    <GuideBanner bg-image-src="/img/ui/archivos.jpg" />
  </div>
</template>
