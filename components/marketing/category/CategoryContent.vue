<script setup lang="ts">
import { computed } from "vue"
import { cn } from "@/lib/utils"
import CategoryLead from "@/components/marketing/category/CategoryLead.vue"
import CategoryRail from "@/components/marketing/category/CategoryRail.vue"
import CategoryProductsGrid from "@/components/marketing/category/CategoryProductsGrid.vue"
import CategoryFaq from "@/components/marketing/category/CategoryFaq.vue"
import CategoryGuideCTA from "@/components/marketing/category/CategoryGuideCTA.vue"
import type { Block, Tab } from "@/utils/categoryRail"

type IncomingFaq = {
  q?: string
  a?: string
  question?: string
  answer?: string
}

type IncomingImage = {
  src?: string
  alt?: string
  width?: number
  height?: number
} | null

type IncomingTab = {
  id?: string
  title?: string
  blocks?: Block[]
  content?: Block[]
  text?: string
  html?: string
}

type IncomingProduct = {
  title?: string
  to?: string
  path?: string
  imageSrc?: string
  imageAlt?: string
  image?: IncomingImage
  ctaText?: string
  description?: string
}

type GuideCta = {
  imageSrc?: string | null
  imageAlt?: string
  title?: string
  description?: string
  to?: string
  ctaLabel?: string
}

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    imageSrc?: string | null
    imageAlt?: string
    tabs?: IncomingTab[] | null
    products?: IncomingProduct[] | null
    faqs?: IncomingFaq[] | null
    guideCta?: GuideCta | null

    stickyTop?: number
    railScrollOffset?: number

    class?: string
    leadClass?: string
    railClass?: string
    asideContainerClass?: string

    productsTitle?: string
    productsSubtitle?: string
    productsCtaText?: string

    faqTitle?: string
    faqSubtitle?: string
  }>(),
  {
    title: "",
    description: "",
    imageSrc: null,
    imageAlt: "",
    tabs: () => [],
    products: () => [],
    faqs: () => [],
    guideCta: null,

    stickyTop: 96,
    railScrollOffset: 132,

    class: "",
    leadClass: "",
    railClass: "",
    asideContainerClass: "mx-auto w-full max-w-[1100px] px-6 lg:px-16",

    productsTitle: "Productos relacionados",
    productsSubtitle: "",
    productsCtaText: "Ver producto",

    faqTitle: "Preguntas frecuentes",
    faqSubtitle: "",
  }
)

function toTextBlock(text: string, html = false): Block {
  return {
    type: "text",
    text,
    html,
  } as Block
}

function normalizeTabBlocks(tab: IncomingTab): Block[] {
  if (Array.isArray(tab.blocks) && tab.blocks.length) {
    return tab.blocks.filter(Boolean)
  }

  if (Array.isArray(tab.content) && tab.content.length) {
    return tab.content.filter(Boolean)
  }

  const html = String(tab.html ?? "").trim()
  if (html) return [toTextBlock(html, true)]

  const text = String(tab.text ?? "").trim()
  if (text) return [toTextBlock(text, false)]

  return []
}

const safeTabs = computed<Tab[]>(() =>
  (props.tabs || [])
    .map((tab, index) => {
      const title = String(tab?.title ?? "").trim()
      const id = String(tab?.id ?? "").trim() || `seccion-${index + 1}`
      const blocks = normalizeTabBlocks(tab)

      if (!title || !blocks.length) return null

      return {
        id,
        title,
        blocks,
      } as Tab
    })
    .filter(Boolean) as Tab[]
)

const leadChips = computed(() =>
  safeTabs.value
    .map((tab) => String(tab.title || "").trim())
    .filter(Boolean)
    .slice(0, 3)
)

const safeProducts = computed(() =>
  (props.products || [])
    .map((item) => {
      const title = String(item?.title ?? "").trim()
      const to = String(item?.to ?? item?.path ?? "").trim()
      const imageSrc =
        String(item?.imageSrc ?? item?.image?.src ?? "").trim() || undefined
      const imageAlt =
        String(item?.imageAlt ?? item?.image?.alt ?? title).trim() || title

      if (!title || !to) return null

      return {
        title,
        to,
        imageSrc,
        imageAlt,
        ctaText: String(item?.ctaText ?? "").trim() || undefined,
      }
    })
    .filter(Boolean)
)

const safeFaqs = computed(() =>
  (props.faqs || []).filter((item) => {
    const q = String(item?.q ?? item?.question ?? "").trim()
    const a = String(item?.a ?? item?.answer ?? "").trim()
    return q && a
  })
)

const hasLead = computed(
  () =>
    Boolean(String(props.title || "").trim()) ||
    Boolean(String(props.description || "").trim())
)

const hasRail = computed(() => safeTabs.value.length > 0)
const hasProducts = computed(() => safeProducts.value.length > 0)
const hasFaqs = computed(() => safeFaqs.value.length > 0)
const hasGuideCta = computed(() => Boolean(props.guideCta))
</script>

<template>
  <section :class="cn('bg-background text-foreground', props.class)">
    <div
      v-if="hasLead"
      class="mx-auto w-full max-w-[1100px] px-6 pt-10 md:px-10 md:pt-14 lg:px-16"
    >
      <CategoryLead
        :title="title"
        :description="description || ''"
        :image-src="imageSrc"
        :chips="leadChips"
        :class="cn('mb-0', props.leadClass)"
      />
    </div>

   

    <div
      v-if="hasProducts || hasFaqs || hasGuideCta"
      :class="props.asideContainerClass"
    >
      <div class="space-y-16 py-12 md:space-y-20 md:py-16">
        <section
          v-if="hasProducts"
          id="productos"
          aria-labelledby="category-products-heading"
        >
          <CategoryProductsGrid
            :title="productsTitle"
            :subtitle="productsSubtitle"
            :items="safeProducts"
            :cta-text="productsCtaText"
          />
        </section>
         <CategoryRail
      v-if="hasRail"
      :tabs="safeTabs"
      :sticky-top="stickyTop"
      :scroll-offset="railScrollOffset"
      :container-class="'mx-auto w-full max-w-[1100px] px-6 md:px-10 lg:px-16'"
      density="comfortable"
      :class="props.railClass"
    />
        <CategoryFaq
  :items="faqs"
  title="Preguntas frecuentes"
  subtitle="Respondemos las dudas más habituales sobre materiales, acabados, formatos y tiempos de producción."
/>

        <CategoryGuideCTA
          v-if="hasGuideCta"
          :image-src="guideCta?.imageSrc || null"
          :image-alt="guideCta?.imageAlt || ''"
          :title="guideCta?.title"
          :description="guideCta?.description"
          :to="guideCta?.to"
          :cta-label="guideCta?.ctaLabel"
        />
      </div>
    </div>
  </section>
</template>