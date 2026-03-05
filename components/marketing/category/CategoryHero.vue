<!-- components/marketing/category/CategoryHero.vue -->
<script setup lang="ts">
import { computed } from "vue"
import { cn } from "@/lib/utils"

type BreadcrumbItem = { label: string; to: string }
type HeroCta = { text: string; link: string }

type CategoryLike = {
  title?: string
  nav?: string
  description?: string
  heroDescription?: string
  imageSrc?: string
  image?: { src?: string; alt?: string }
  alt?: string
  breadcrumbs?: BreadcrumbItem[]
  cta?: Partial<HeroCta>
}

const props = withDefaults(
  defineProps<{
    category: CategoryLike
    showBreadcrumbs?: boolean
    showCta?: boolean
    containerClass?: string
  }>(),
  { showBreadcrumbs: false, showCta: false, containerClass: "" }
)

const title = computed(() => props.category?.title || props.category?.nav || "Categoría")
const description = computed(() => props.category?.heroDescription || props.category?.description || "")
const imgSrc = computed(() => props.category?.imageSrc || props.category?.image?.src || null)
const imgAlt = computed(() => props.category?.alt || props.category?.image?.alt || title.value)
const breadcrumbs = computed(() => props.category?.breadcrumbs || [])

const cta = computed<HeroCta>(() => ({
  text: "Ver productos",
  link: "#productos",
  ...(props.category?.cta || {}),
}))

const container = computed(() =>
  cn("mx-auto w-full max-w-[1200px] px-6 md:px-10", props.containerClass)
)
</script>

<template>
  <!-- alturas exactas -->
  <header class="relative overflow-hidden h-[252px] md:h-[360px]">
    <!-- background -->
    <img
      v-if="imgSrc"
      :src="imgSrc"
      :alt="imgAlt"
      class="absolute inset-0 h-full w-full object-cover object-[70%_50%]"
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />

    <!-- overlay exacto: #DEF4FFBF -->
    <div class="absolute inset-0 bg-[#DEF4FFBF]" />

    <!-- contenido -->
    <div :class="cn('relative z-10 h-full', container)">
      <div class="flex h-full items-center">
        <div class="max-w-[760px]">
          <nav
            v-if="showBreadcrumbs && breadcrumbs.length"
            aria-label="Breadcrumb"
            class="mb-4 text-xs text-slate-600"
          >
            <ol class="flex flex-wrap items-center gap-2">
              <li v-for="(b, i) in breadcrumbs" :key="i" class="flex items-center gap-2">
                <NuxtLink :to="b.to" class="hover:text-foreground">{{ b.label }}</NuxtLink>
                <span v-if="i < breadcrumbs.length - 1" class="text-slate-600/60">/</span>
              </li>
            </ol>
          </nav>

          <!-- Ajusta aquí si quieres que en móvil sea más grande como en tu captura -->
          <h1 class="font-semibold text-foreground text-[30px] leading-[36px]">
            {{ title }}
          </h1>

          <p
            v-if="description"
            class="mt-4 text-[15px] leading-[22px] text-slate-600 max-w-[680px]"
          >
            {{ description }}
          </p>

          <div v-if="showCta" class="mt-7">
            <a
              :href="cta.link"
              class="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {{ cta.text }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>