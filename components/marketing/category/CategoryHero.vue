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

    /** Permite reutilizar tu container global (evita hardcode) */
    containerClass?: string

    /** Ajuste fino por si quieres 1 variante más compacta */
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
const description = computed(
  () => props.category?.heroDescription || props.category?.description || ""
)

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

const contentWrapClass = computed(() =>
  cn(
    // 1440px como en diseño, pero overrideable desde fuera
    "mx-auto w-full max-w-[1440px] px-6",
    // más “Figma-like” en desktop
    "lg:px-16 xl:px-24",
    props.containerClass
  )
)

const paddingYClass = computed(() =>
  props.density === "compact"
    ? "py-10 md:py-12"
    : "py-14 md:py-16 lg:py-20"
)
</script>

<template>
  <header class="relative overflow-hidden bg-muted/30">
    <!-- Background -->
    <div class="absolute inset-0 pointer-events-none select-none">
      <NuxtImg
        v-if="bgSrc"
        :src="bgSrc"
        :alt="alt"
        class="absolute inset-y-0 right-0 h-full w-full object-cover object-right opacity-15 grayscale blur-[1px] md:opacity-20"
        loading="eager"
        decoding="async"
      />

      <!-- Velo + degradados para clavar legibilidad -->
      <div class="absolute inset-0 bg-background/55" />
      <div
        class="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-background/35" />
    </div>

    <!-- Content -->
    <div :class="cn('relative', paddingYClass)">
      <div :class="contentWrapClass">
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
              <span v-if="i < breadcrumbs.length - 1" class="text-muted-foreground/60"
                >/</span
              >
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
    </div>
  </header>
</template>
