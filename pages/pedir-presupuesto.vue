<script setup lang="ts">
import { computed } from "vue";

import QuoteHero from "@/components/marketing/quote/QuoteHero.vue";
import QuoteFormSection from "@/components/marketing/quote/FormSection.vue";
import ContactInfoBand from "@/components/marketing/ContactInfoBand.vue";
import MarketingProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";

// si NO lo tienes auto-importado por Nuxt, importa el composable:
// import { useHomeCategoriesGrid } from "@/composables/useHomeCategoriesGrid"

const { data: homeCategoriesData } = await useHomeCategoriesGrid(8);
const homeCategories = computed(() => homeCategoriesData.value ?? []);
</script>

<template>
  <div>
    <QuoteHero />
    <!-- ✅ padding 48px arriba/abajo -->
    <section class="bg-background py-12">
  <div class="page-shell">
    <div class="mx-auto w-full max-w-[549px]">
      <QuoteFormSection submit-endpoint="/api/price-requests" />
    </div>
  </div>
</section>
<ContactInfoBand
  section-class="bg-brand-dark text-brand-ink-light py-20"
  container-class="page-shell"
/>

    <MarketingProductCategoryGrid
      title="Si buscas algo específico puedes explorar nuestras categorías de producto"
      :categories="homeCategories"
      :total-slots="8"
    />

    <GuideBanner bg-image-src="/img/ui/archivos.jpg" />
  </div>
</template>
