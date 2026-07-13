<script setup lang="ts">
import { computed } from "vue";

import HeaderPage from "@/components/shared/hero/HeaderPage.vue";
import QuoteFormSection from "@/components/marketing/quote/FormSection.vue";
import ContactInfoBand from "@/components/marketing/ContactInfoBand.vue";
import MarketingProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";
useSeoMeta({
  title: "Solicitar presupuesto de impresión | Repro Disseny",
  description:
    "Solicita presupuesto para impresión digital, gran formato, packaging, expositores, eventos y materiales corporativos a medida.",
});

const {
  categories: homeCategories,
  pending: homeCategoriesPending,
} = useHomeCategoriesGrid(8);
</script>

<template>
  <div>
    <HeaderPage
      title="Solicita tu presupuesto"
      description="Cuéntanos qué necesitas y te ayudamos a definir materiales, medidas, acabados y la mejor solución para tu proyecto."
    />

    <section class="bg-background py-12">
      <div class="container-wide">
        <div class="mx-auto w-full max-w-[549px]">
          <QuoteFormSection submit-endpoint="/api/price-requests" />
        </div>
      </div>
    </section>

    <ContactInfoBand
      section-class="bg-brand-base-dark text-brand-ink-light py-20"
      container-class="container-wide"
    />

    <MarketingProductCategoryGrid
      title="Si buscas algo específico puedes explorar nuestras categorías de producto"
      :categories="homeCategories"
      :total-slots="8"
      :pending="homeCategoriesPending"
    />

    <GuideBanner bg-image-src="/img/ui/archivos.jpg" />
  </div>
</template>
