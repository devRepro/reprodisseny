<template>
  <div>
    <HomeHero>
      <HomeImageStrip :images="stripImages" />
    </HomeHero>
    <MarketingProductCategoryGrid
      title="Nuestros productos"
      :categories="homeCategories"
      :total-slots="8"
    />

  
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import HomeHero from "@/components/marketing/HomeHero.vue"
import HomeImageStrip from "@/components/marketing/HomeImageStrip.vue"

type CategoryItem = {
  slug: string
  title: string
  image?: string | null
  href?: string
  path?: string
}

// ✅ Cargar categorías (SSR)
const { data: categoriesData } = await useFetch<CategoryItem[]>("/api/cms/home-categories", {
  server: true,
  default: () => [],
})

const homeCategories = computed(() => categoriesData.value ?? [])

// ✅ Imágenes strip (ya en Blob)
const stripImages = [
  { src: "https://webcms.blob.core.windows.net/media/home/preimpresion.webp", alt: "Diseño y producción" },
  { src: "https://webcms.blob.core.windows.net/media/home/impresion.webp", alt: "Impresión profesional" },
  { src: "https://webcms.blob.core.windows.net/media/home/instalacion-vinilo.webp", alt: "Instalación" },
  { src: "https://webcms.blob.core.windows.net/media/home/logistica.webp", alt: "Logística" },
]
</script>
