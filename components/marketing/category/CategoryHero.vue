<script setup lang="ts">
import { computed } from "vue"
import { cn } from "@/lib/utils"

type HeroCta = {
  label: string
  to: string
}

type HeroImage = {
  src?: string
  alt?: string
  width?: number
  height?: number
} | null

type CategoryLike = {
  title?: string
  nav?: string
  description?: string
  heroDescription?: string
  imageSrc?: string
  image?: HeroImage
  alt?: string
}

const props = withDefaults(
  defineProps<{
    category: CategoryLike
    showPrimaryCta?: boolean
    showSecondaryCta?: boolean
    primaryCta?: Partial<HeroCta> | null
    secondaryCta?: Partial<HeroCta> | null
    class?: string
    containerClass?: string
  }>(),
  {
    showPrimaryCta: true,
    showSecondaryCta: true,
    primaryCta: () => ({ label: "Pedir presupuesto", to: "/contacto" }),
    secondaryCta: () => ({ label: "Ver productos", to: "#productos" }),
    class: "",
    containerClass: "",
  }
)

const title = computed(
  () => props.category?.title || props.category?.nav || "Categoría"
)

const description = computed(
  () => props.category?.heroDescription || props.category?.description || ""
)

const imgSrc = computed(
  () => props.category?.imageSrc || props.category?.image?.src || ""
)

const imgAlt = computed(
  () => props.category?.alt || props.category?.image?.alt || title.value
)

const primaryCta = computed<HeroCta | null>(() => {
  const to = String(props.primaryCta?.to || "").trim()
  const label = String(props.primaryCta?.label || "").trim()
  if (!to || !label) return null
  return { to, label }
})

const secondaryCta = computed<HeroCta | null>(() => {
  const to = String(props.secondaryCta?.to || "").trim()
  const label = String(props.secondaryCta?.label || "").trim()
  if (!to || !label) return null
  return { to, label }
})
</script>

<template>
  <header
    :class="
      cn(
        'relative overflow-hidden bg-background',
        'pt-6 md:pt-8 lg:pt-10',
        'pb-10 md:pb-14 lg:pb-16',
        props.class
      )
    "
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,hsl(var(--brand-base-light)/0.95)_0%,transparent_34%)]"
      />
      <div
        class="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_72%,hsl(var(--accent)/0.32)_100%)]"
      />
    </div>

    <div :class="cn('container-content relative z-10', props.containerClass)">
      <div class="grid items-center gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)] lg:gap-12">
        <div class="min-w-0">
          <p class="mb-3 text-label uppercase tracking-[0.08em] text-primary">
            Categoría
          </p>

          <h1 class="max-w-[15ch] text-[clamp(2.1rem,4.2vw,4.15rem)] font-bold leading-[1.03] text-foreground">
            {{ title }}
          </h1>

          <p
            v-if="description"
            class="mt-6 max-w-[66ch] text-body text-foreground/82 md:text-[18px] md:leading-[1.68]"
          >
            {{ description }}
          </p>

          <div
            v-if="(showPrimaryCta && primaryCta) || (showSecondaryCta && secondaryCta)"
            class="mt-8 flex flex-wrap items-center gap-3"
          >
            <NuxtLink
              v-if="showPrimaryCta && primaryCta"
              :to="primaryCta.to"
              class="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 py-3 text-body-s-bold text-primary-foreground transition hover:opacity-90"
            >
              {{ primaryCta.label }}
            </NuxtLink>

            <NuxtLink
              v-if="showSecondaryCta && secondaryCta"
              :to="secondaryCta.to"
              class="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-background px-5 py-3 text-body-s-bold text-foreground transition hover:border-primary/25 hover:text-primary"
            >
              {{ secondaryCta.label }}
            </NuxtLink>
          </div>
        </div>

        <div v-if="imgSrc" class="relative min-w-0">
          <div
            aria-hidden="true"
            class="absolute inset-x-6 top-6 bottom-4 rounded-[36px] bg-[linear-gradient(135deg,hsl(var(--brand-base-light)/0.95)_0%,hsl(var(--brand-bg-2)/0.55)_45%,hsl(var(--background))_100%)] blur-2xl opacity-90"
          />

          <div
            class="relative overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_10px_30px_-18px_hsl(var(--foreground)/0.18)]"
          >
            <img
              :src="imgSrc"
              :alt="imgAlt"
              class="aspect-[4/3] w-full object-cover md:aspect-[5/4] lg:aspect-[4/3]"
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>