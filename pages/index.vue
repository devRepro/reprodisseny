<template>
  <div>
    <CategoriasMenu :tree="menuTree" :pending="menuPending" :error="menuError" />
    <HomeHero>
      <HomeImageStrip :images="stripImages" />
    </HomeHero>
    <GuideBanner title="Sant Jordi" bgImageSrc="/img/marketing/bgfiles.png"
      :cta="{ label: 'Ver la guía rápida', to: '/contacto' }" />

    <MarketingProductCategoryGrid title="Ofrecemos una amplia gama de productos" :categories="homeCategories"
      :total-slots="8" />

    <MarketingServicesGrid />
    <MarketingProcessSection />
    <ClientLogosBand :logos="[
      { src: '/img/customers/vallhebron.svg', alt: `Vall d'Hebron` },
      { src: '/img/customers/fcf.svg', alt: 'Federació Catalana' },
      { src: '/img/customers/adevinta.svg', alt: 'Adevinta' },
      { src: '/img/customers/hitachi.svg', alt: 'Hitachi' },
      { src: '/img/customers/tuv.svg', alt: 'TÜV Rheinland' },
      { src: '/img/customers/vueling.svg', alt: 'Vueling' },
      { src: '/img/customers/cromology.svg', alt: 'Cromology' },
      { src: '/img/customers/who.svg', alt: 'World Health Organization' },
      { src: '/img/customers/uab.svg', alt: 'UAB' },
      { src: '/img/customers/alcon.svg', alt: 'Alcon' },
      { src: '/img/customers/renault.svg', alt: 'Renault' },
      { src: '/img/customers/green-vita.svg', alt: 'Green Vita' },
    ]" />

<GoogleReviewsSection />
<GetFiles />


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
import GuideBanner from "@/components/marketing/GuideBanner.vue"
import ClientLogosBand from "@/components/marketing/ClientLogosBand.vue"
import { GoogleReviewsSection } from "#components"
import GetFiles from "@/components/marketing/GetFiles.vue"
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
