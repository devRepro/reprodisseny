<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";

type HeroCta = {
  label: string;
  to: string;
};

type HeroImage =
  | {
      src?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | null
  | undefined;

type CategoryLike = {
  title?: string | null;
  nav?: string | null;
  description?: string | null;
  heroDescription?: string | null;
  imageSrc?: string | null;
  image?: HeroImage;
  alt?: string | null;
  heroKicker?: string | null;
  heroHighlights?: string[] | null;
};

const props = withDefaults(
  defineProps<{
    category: CategoryLike | null;
    showPrimaryCta?: boolean;
    showSecondaryCta?: boolean;
    primaryCta?: Partial<HeroCta> | null;
    secondaryCta?: Partial<HeroCta> | null;
    class?: string;
    containerClass?: string;
  }>(),
  {
    showPrimaryCta: true,
    showSecondaryCta: true,
    primaryCta: () => ({ label: "Pedir presupuesto", to: "/contacto" }),
    secondaryCta: () => ({ label: "Ver productos", to: "#productos" }),
    class: "",
    containerClass: "",
  }
);

const title = computed(() => props.category?.title || props.category?.nav || "Categoría");

const description = computed(
  () => props.category?.heroDescription || props.category?.description || ""
);

const kicker = computed(() => props.category?.heroKicker || "Impresión personalizada");

const highlights = computed(() =>
  (props.category?.heroHighlights || []).filter(Boolean).slice(0, 4)
);

const rawImgSrc = computed(
  () => props.category?.imageSrc || props.category?.image?.src || ""
);

const imgSrc = computed(() => normalizeCmsMediaSrc(rawImgSrc.value || "") || "");

const imgAlt = computed(
  () => props.category?.alt || props.category?.image?.alt || title.value
);

const imgWidth = computed(() => props.category?.image?.width || undefined);
const imgHeight = computed(() => props.category?.image?.height || undefined);

const isLowResolutionImage = computed(() => {
  const width = Number(imgWidth.value || 0);
  return width > 0 && width < 900;
});

const mediaWrapperClass = computed(() =>
  cn(
    "relative mx-auto w-full",
    isLowResolutionImage.value ? "max-w-[420px]" : "max-w-[520px]"
  )
);

const primaryCta = computed<HeroCta | null>(() => {
  const to = String(props.primaryCta?.to || "").trim();
  const label = String(props.primaryCta?.label || "").trim();

  if (!to || !label) return null;

  return { to, label };
});

const secondaryCta = computed<HeroCta | null>(() => {
  const to = String(props.secondaryCta?.to || "").trim();
  const label = String(props.secondaryCta?.label || "").trim();

  if (!to || !label) return null;

  return { to, label };
});
</script>

<template>
  <header
    :class="
      cn(
        'relative w-full overflow-hidden bg-background',
        'pt-6 pb-10 md:pt-8 md:pb-12 lg:pt-10 lg:pb-16',
        props.class
      )
    "
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[linear-gradient(180deg,hsl(var(--brand-base-light)/0.48)_0%,hsl(var(--background))_72%)]"
    />

    <div
      aria-hidden="true"
      class="pointer-events-none absolute left-0 top-16 hidden h-72 w-72 rounded-full bg-[hsl(var(--brand-base-light)/0.55)] blur-3xl lg:block"
    />

    <div :class="cn('container-content relative z-10', props.containerClass)">
      <div
        class="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)] lg:gap-14"
      >
        <div class="min-w-0">
          <p
            class="mb-5 inline-flex w-fit items-center gap-2 text-label-s font-semibold uppercase tracking-[0.22em] text-primary/80"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            {{ kicker }}
          </p>

          <h1
            class="max-w-[14ch] text-balance text-[clamp(2.35rem,1.55rem+3vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-foreground"
          >
            {{ title }}
          </h1>

          <p
            v-if="description"
            class="mt-6 max-w-[62ch] text-pretty text-[17px] leading-8 text-foreground/74 md:text-[18px]"
          >
            {{ description }}
          </p>

          <ul
            v-if="highlights.length"
            class="mt-7 flex flex-wrap gap-2.5"
            aria-label="Puntos destacados de la categoría"
          >
            <li
              v-for="item in highlights"
              :key="item"
              class="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-body-s text-foreground/76"
            >
              {{ item }}
            </li>
          </ul>

          <div
            v-if="(showPrimaryCta && primaryCta) || (showSecondaryCta && secondaryCta)"
            class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <NuxtLink
              v-if="showPrimaryCta && primaryCta"
              :to="primaryCta.to"
              class="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-body-s-bold text-primary-foreground transition hover:bg-brand-base-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
            >
              {{ primaryCta.label }}
            </NuxtLink>

            <NuxtLink
              v-if="showSecondaryCta && secondaryCta"
              :to="secondaryCta.to"
              class="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-body-s-bold text-foreground transition hover:border-primary/25 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
            >
              {{ secondaryCta.label }}
            </NuxtLink>
          </div>
        </div>

        <div v-if="imgSrc" class="relative min-w-0 lg:justify-self-end">
          <figure :class="mediaWrapperClass">
            <div
              class="relative overflow-hidden rounded-[28px] border border-border/70 bg-card"
            >
              <img
                :src="imgSrc"
                :alt="imgAlt"
                :width="imgWidth"
                :height="imgHeight"
                class="aspect-[4/3] w-full object-cover"
                loading="eager"
                decoding="async"
                fetchpriority="high"
              />

              <div
                aria-hidden="true"
                class="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30"
              />
            </div>

            <div
              aria-hidden="true"
              class="absolute -bottom-4 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            />
          </figure>
        </div>
      </div>
    </div>
  </header>
</template>