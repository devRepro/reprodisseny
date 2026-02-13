<!-- components/marketing/category/CategoryHero.vue -->
<script setup lang="ts">
import { computed } from "vue"

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
  }>(),
  {
    showBreadcrumbs: false,
    showCta: false,
  }
)

const title = computed(() => props.category?.title || props.category?.nav || "Categoría")
const description = computed(() => props.category?.heroDescription || props.category?.description || "")

const bgSrc = computed(() => {
  const c = props.category || {}
  return c.imageSrc || c.image?.src || null
})

const alt = computed(() => props.category?.alt || props.category?.image?.alt || title.value)

const breadcrumbs = computed(() => props.category?.breadcrumbs || [])

const cta = computed<HeroCta>(() => ({
  text: "Ver productos",
  link: "#productos",
  ...(props.category?.cta || {}),
}))
</script>

<template>
  <header class="relative overflow-hidden bg-sky-50">
    <!-- Background -->
    <div class="absolute inset-0">
      <!-- Imagen suave (como en el diseño) -->
      <NuxtImg
        v-if="bgSrc"
        :src="bgSrc"
        :alt="alt"
        class="h-full w-full object-cover object-right opacity-25 grayscale"
        loading="eager"
        decoding="async"
      />

      <!-- Velo claro + gradiente para legibilidad -->
      <div class="absolute inset-0 bg-sky-50/70" />
      <div class="absolute inset-0 bg-gradient-to-r from-sky-50 via-sky-50/90 to-sky-50/30" />
    </div>

    <!-- Content -->
    <div
      class="relative mx-auto flex min-h-[210px] max-w-7xl flex-col justify-center px-6 py-10 md:min-h-[230px]"
    >
      <!-- Breadcrumbs (no visibles por defecto, por diseño) -->
      <nav
        v-if="showBreadcrumbs && breadcrumbs.length"
        aria-label="Breadcrumb"
        class="mb-4 text-xs text-slate-600"
      >
        <ol class="flex flex-wrap items-center gap-2">
          <li v-for="(b, i) in breadcrumbs" :key="i" class="flex items-center gap-2">
            <NuxtLink :to="b.to" class="hover:text-slate-900">
              {{ b.label }}
            </NuxtLink>
            <span v-if="i < breadcrumbs.length - 1" class="text-slate-400">/</span>
          </li>
        </ol>
      </nav>

      <h1 class="text-[28px] font-semibold leading-[1.15] text-slate-900 md:text-[32px]">
        {{ title }}
      </h1>

      <p v-if="description" class="mt-3 max-w-xl text-sm leading-5 text-slate-600">
        {{ description }}
      </p>

      <!-- CTA (desactivado por defecto para clavar el diseño) -->
      <div v-if="showCta" class="mt-6">
        <a
          :href="cta.link"
          class="inline-flex items-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          {{ cta.text }}
        </a>
      </div>
    </div>
  </header>
</template>
