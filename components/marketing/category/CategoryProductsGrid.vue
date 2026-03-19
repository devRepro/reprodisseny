<script setup lang="ts">
import { computed } from "vue"
import { cn } from "@/lib/utils"

type GridItem = {
  title: string
  to: string
  imageSrc?: string
  imageAlt?: string
  ctaText?: string
}

const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    eyebrow?: string
    items: GridItem[]
    ctaText?: string
    class?: string
  }>(),
  {
    title: "¿Qué quieres hacer?",
    subtitle: "",
    eyebrow: "Productos de esta categoría",
    items: () => [],
    ctaText: "Ver producto",
    class: "",
  }
)

const safeItems = computed(() =>
  (props.items || []).filter((item) => item?.title && item?.to)
)
</script>

<template>
  <section
    :class="cn('w-full', props.class)"
    aria-labelledby="category-grid-heading"
  >
    <header class="max-w-[760px]">
      <p
        v-if="eyebrow"
        class="text-label uppercase tracking-[0.08em] text-primary"
      >
        {{ eyebrow }}
      </p>

      <h2
        id="category-grid-heading"
        class="mt-3 text-[clamp(2rem,2.7vw,2.85rem)] font-bold leading-[1.08] tracking-tight text-foreground"
      >
        {{ title }}
      </h2>

      <p
        v-if="subtitle"
        class="mt-3 max-w-[68ch] text-body text-foreground/78 md:text-[18px] md:leading-[1.68]"
      >
        {{ subtitle }}
      </p>
    </header>

    <div class="mt-8 md:mt-10">
      <div
        v-if="safeItems.length"
        class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4"
      >
        <NuxtLink
          v-for="(it, i) in safeItems"
          :key="`${it.to}-${i}`"
          :to="it.to"
          :aria-label="`Ver detalles de ${it.title}`"
          class="group flex h-full flex-col items-center rounded-[28px] border border-border/70 bg-card px-5 pb-6 pt-5 text-center shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.16)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_40px_-26px_hsl(var(--foreground)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
        >
<div class="relative mx-auto w-full max-w-[236px]">
  <div
    aria-hidden="true"
    class="absolute -inset-2 rounded-full bg-[linear-gradient(180deg,hsl(var(--accent)/0.82)_0%,hsl(var(--background))_100%)] blur-xl opacity-75 transition-opacity duration-300 group-hover:opacity-100"
  />

  <div
    class="relative grid aspect-square w-full place-items-center rounded-full border border-border/70 bg-[linear-gradient(180deg,hsl(var(--accent)/0.55)_0%,hsl(var(--background))_100%)] p-3"
  >
    <div class="h-full w-full overflow-hidden rounded-full bg-muted/40 ring-1 ring-border/60">
      <img
        v-if="it.imageSrc"
        :src="it.imageSrc"
        :alt="it.imageAlt || ''"
        width="220"
        height="220"
        class="h-full w-full object-cover object-center origin-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        loading="lazy"
        decoding="async"
      />
      <div
        v-else
        class="grid h-full w-full place-items-center bg-muted text-body-s text-muted-foreground"
      >
        Imagen no disponible
      </div>
    </div>
  </div>
</div>
          <div class="mt-6 flex min-h-[72px] items-start justify-center">
            <h3
              aria-hidden="true"
              class="max-w-[18ch] text-[clamp(1.05rem,1.3vw,1.2rem)] font-semibold leading-[1.35] tracking-tight text-foreground"
            >
              {{ it.title }}
            </h3>
          </div>

          <span
            aria-hidden="true"
            class="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-body-s-bold text-primary-foreground shadow-sm transition group-hover:opacity-90"
          >
            {{ it.ctaText || props.ctaText }}
          </span>
        </NuxtLink>
      </div>

      <div
        v-else
        class="rounded-[24px] border border-border/70 bg-card px-5 py-4 text-body-s text-muted-foreground"
      >
        No hay elementos disponibles.
      </div>
    </div>
  </section>
</template>
