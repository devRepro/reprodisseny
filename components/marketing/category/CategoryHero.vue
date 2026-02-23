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
    density?: "comfortable" | "compact"
  }>(),
  {
    showBreadcrumbs: false,
    showCta: false,
    containerClass: "",
    density: "comfortable",
  }
)

const title = computed(() => props.category?.title || props.category?.nav || "Categoría")
const description = computed(() => props.category?.heroDescription || props.category?.description || "")

const imgSrc = computed(() => {
  const c = props.category || {}
  return c.imageSrc || c.image?.src || null
})

const imgAlt = computed(() => props.category?.alt || props.category?.image?.alt || "")
const breadcrumbs = computed(() => props.category?.breadcrumbs || [])

const cta = computed<HeroCta>(() => ({
  text: "Ver productos",
  link: "#productos",
  ...(props.category?.cta || {}),
}))

const contentWrapClass = computed(() =>
  cn("mx-auto w-full max-w-[1440px] px-6 lg:px-16 xl:px-24", props.containerClass)
)

const paddingYClass = computed(() =>
  props.density === "compact" ? "py-10 md:py-12" : "py-14 md:py-16 lg:py-20"
)
</script>

<template>
  <header class="bg-background">
    <div :class="cn(contentWrapClass, paddingYClass)">
      <div class="grid items-center gap-10 md:grid-cols-12">
        <!-- Texto -->
        <div class="md:col-span-7">
          <nav
            v-if="showBreadcrumbs && breadcrumbs.length"
            aria-label="Breadcrumb"
            class="mb-4 text-xs text-muted-foreground"
          >
            <ol class="flex flex-wrap items-center gap-2">
              <li v-for="(b, i) in breadcrumbs" :key="i" class="flex items-center gap-2">
                <NuxtLink :to="b.to" class="hover:text-foreground">
                  {{ b.label }}
                </NuxtLink>
                <span v-if="i < breadcrumbs.length - 1" class="text-muted-foreground/60">/</span>
              </li>
            </ol>
          </nav>

          <h1
            class="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            {{ title }}
          </h1>

          <p
            v-if="description"
            class="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg"
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

        <!-- Imagen (CLARA y entendible) -->
        <div v-if="imgSrc" class="md:col-span-5">
          <div class="pointer-events-none select-none">
            <NuxtImg
              :src="imgSrc"
              :alt="imgAlt"
              loading="eager"
              decoding="async"
              class="
                w-full
                max-h-[220px] sm:max-h-[260px] md:max-h-[320px] lg:max-h-[360px]
                object-contain object-right
                opacity-90
              "
            />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>