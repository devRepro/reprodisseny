<template>
  <div>
    <HomeHero>
      <HomeImageStrip :images="stripImages" />
    </HomeHero>

    <GuideBanner
      title="Sant Jordi"
      bgImageSrc="/img/ui/archivos-book-4k.webp"
      :cta="{ label: 'Ver la guía rápida', to: '/contacto' }"
    />

 <MarketingProductCategoryGrid
  title="Ofrecemos una amplia gama de productos"
  description="Explora las principales categorías y encuentra la solución que mejor encaja con tu proyecto."
  :categories="homeCategories"
  :total-slots="8"
  :pending="homeCategoriesPending"
/>

    <MarketingServicesGrid />
    <MarketingProcessSection />

    <ClientLogosBand :logos="clientLogos" />

    <GoogleReviewsSection />

    <GetFiles submit-endpoint="/api/price-requests" />
  </div>
</template>

<script setup lang="ts">
import HomeHero from "@/components/marketing/HomeHero.vue";
import HomeImageStrip from "@/components/marketing/HomeImageStrip.vue";
import MarketingProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue";
import MarketingProcessSection from "@/components/marketing/ProcessSection.vue";
import GuideBanner from "@/components/marketing/GuideBanner.vue";
import ClientLogosBand from "@/components/marketing/ClientLogosBand.vue";
import GetFiles from "@/components/marketing/GetFiles.vue";
import { useHomeCategoriesGrid } from "@/composables/useHomeCategoriesGrid";
import { GoogleReviewsSection, MarketingServicesGrid } from "#components";

definePageMeta({ layout: "home" });

const {
  categories: homeCategories,
  pending: homeCategoriesPending,
  error: homeCategoriesError,
} = await useHomeCategoriesGrid(8);

const stripImages = [
  {
    src: "https://webcms.blob.core.windows.net/media/home/preimpresion.webp",
    alt: "Diseño y producción",
  },
  {
    src: "https://webcms.blob.core.windows.net/media/home/impresion.webp",
    alt: "Impresión profesional",
  },
  {
    src: "https://webcms.blob.core.windows.net/media/home/instalacion-vinilo.webp",
    alt: "Instalación",
  },
  {
    src: "https://webcms.blob.core.windows.net/media/home/logistica.webp",
    alt: "Logística",
  },
];

const clientLogos = [
  { src: "/img/customers/vallhebron.svg", alt: "Vall d'Hebron" },
  { src: "/img/customers/fcf.svg", alt: "Federació Catalana" },
  { src: "/img/customers/adevinta.svg", alt: "Adevinta" },
  { src: "/img/customers/hitachi.svg", alt: "Hitachi" },
  { src: "/img/customers/tuv.svg", alt: "TÜV Rheinland" },
  { src: "/img/customers/vueling.svg", alt: "Vueling" },
  { src: "/img/customers/cromology.svg", alt: "Cromology" },
  { src: "/img/customers/who.svg", alt: "World Health Organization" },
  { src: "/img/customers/uab.svg", alt: "UAB" },
  { src: "/img/customers/alcon.svg", alt: "Alcon" },
  { src: "/img/customers/renault.svg", alt: "Renault" },
  { src: "/img/customers/green-vita.svg", alt: "Green Vita" },
];

if (import.meta.dev && homeCategoriesError.value) {
  console.error("[HOME] error cargando categorías del grid:", homeCategoriesError.value);
}
</script>
