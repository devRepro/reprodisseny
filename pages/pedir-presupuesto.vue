<template>
  <div>
    <QuoteFormSection submit-endpoint="/api/public/quote" />

    <ContactInfoBand />

    <ProductCategoryGrid
      title="Si buscas algo específico puedes explorar nuestras categorías de producto"
      :categorias="categoryCards"
    />

    <GuideBanner bg-image-src="/img/ui/archivos.jpg" />
  </div>
</template>

<script setup lang="ts">

import ContactInfoBand from "@/components/marketing/ContactInfoBand.vue";
import ProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";

import { getCategories, mapCategoriesToCards } from "~/server/utils/catalogContent";

const { data: categories } = await useAsyncData(
  "quoteCategories",
  () => getCategories(),
  { default: () => [] }
);
const categoryCards = computed(() => mapCategoriesToCards(categories.value));
</script>
