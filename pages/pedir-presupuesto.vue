<script setup lang="ts">
import QuoteHero from "@/components/marketing/quote/QuoteHero.vue";
import QuoteFormSection from "@/components/marketing/quote/FormSection.vue";
import ContactInfoBand from "@/components/marketing/ContactInfoBand.vue";
import MarketingProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue";
import SectionMediaBanner from "@/components/shared/banner/SectionMediaBanner.vue";

const {
  categories: homeCategories,
  pending: homeCategoriesPending,
} = useHomeCategoriesGrid(8);
</script>

<template>
  <div>
    <QuoteHero />

    <section class="bg-background py-12">
      <div class="container-wide">
        <div class="mx-auto w-full max-w-[549px]">
          <QuoteFormSection submit-endpoint="/api/price-requests" />
        </div>
      </div>
    </section>

    <ContactInfoBand
      section-class="bg-brand-dark text-brand-ink-light py-20"
      container-class="container-wide"
    />

    <MarketingProductCategoryGrid
      title="Si buscas algo específico puedes explorar nuestras categorías de producto"
      :categories="homeCategories ?? []"
      :total-slots="8"
      :pending="homeCategoriesPending"
    />

    <SectionMediaBanner
      title="Cómo preparar tus archivos"
      description="Revisa formatos, resolución y aspectos clave antes de enviarnos el arte final."
      primary-label="Ver la guía rápida"
      primary-to="/como-preparar-archivos"
      bg-image-src="/img/ui/archivos.jpg"
      image-alt="Preparación de archivos para impresión"
    />
  </div>
</template>
