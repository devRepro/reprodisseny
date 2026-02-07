<template>
  <div>
    <SharedHeader />

    <HomeHero>
      <HomeImageStrip :images="stripImages" />
    </HomeHero>

    <MarketingProductCategoryGrid
      title="Ofrecemos una amplia gama de productos"
      :categories="homeCategories"
      :total-slots="8"
    />

    <MarketingServicesGrid />

    <MarketingProcessSection />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import HomeHero from "@/components/marketing/HomeHero.vue"
import HomeImageStrip from "@/components/marketing/HomeImageStrip.vue"
import MarketingProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue"
import MarketingProcessSection from "@/components/marketing/ProcessSection.vue"
import { useHomeCategoriesGrid } from "@/composables/useHomeCategoriesGrid"
import { MarketingServicesGrid } from "#components"

const { data: homeCategoriesData } = await useHomeCategoriesGrid(8)
const homeCategories = computed(() => homeCategoriesData.value ?? [])

const stripImages = [
  { src: "https://webcms.blob.core.windows.net/media/home/preimpresion.webp", alt: "Diseño y producción" },
  { src: "https://webcms.blob.core.windows.net/media/home/impresion.webp", alt: "Impresión profesional" },
  { src: "https://webcms.blob.core.windows.net/media/home/instalacion-vinilo.webp", alt: "Instalación" },
  { src: "https://webcms.blob.core.windows.net/media/home/logistica.webp", alt: "Logística" },
]
</script>
