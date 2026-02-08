<template>
  <div>
    <HomeHero>
      <HomeImageStrip :images="stripImages" />
    </HomeHero>

    <!-- ✅ Menú debajo del slider -->
    <CategoriasMenu :tree="menuTree" :pending="menuPending" :error="menuError" />

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
import { computed, inject, type ComputedRef, type Ref } from "vue"
import type { CategoriaNode } from "~/composables/useCategoriasNav"

import CategoriasMenu from "@/components/shared/menu/Categorias.vue"
import HomeHero from "@/components/marketing/HomeHero.vue"
import HomeImageStrip from "@/components/marketing/HomeImageStrip.vue"
import MarketingProductCategoryGrid from "@/components/marketing/ProductCategoryGrid.vue"
import MarketingProcessSection from "@/components/marketing/ProcessSection.vue"
import { useHomeCategoriesGrid } from "@/composables/useHomeCategoriesGrid"
import { MarketingServicesGrid } from "#components"

definePageMeta({ layout: "home" })

// ✅ Inyectamos el bundle del layout
type NavMenuProvide = {
  tree: ComputedRef<CategoriaNode[]>
  pending: Ref<boolean>
  error: Ref<unknown>
}

const navMenu = inject<NavMenuProvide>("navMenu")

// ✅ Importante: pasar VALORES (no refs) a props
const menuTree = computed(() => navMenu?.tree.value ?? [])
const menuPending = computed(() => navMenu?.pending.value ?? false)
const menuError = computed(() => navMenu?.error.value ?? null)

const { data: homeCategoriesData } = await useHomeCategoriesGrid(8)
const homeCategories = computed(() => homeCategoriesData.value ?? [])

const stripImages = [
  { src: "https://webcms.blob.core.windows.net/media/home/preimpresion.webp", alt: "Diseño y producción" },
  { src: "https://webcms.blob.core.windows.net/media/home/impresion.webp", alt: "Impresión profesional" },
  { src: "https://webcms.blob.core.windows.net/media/home/instalacion-vinilo.webp", alt: "Instalación" },
  { src: "https://webcms.blob.core.windows.net/media/home/logistica.webp", alt: "Logística" },
]
</script>
