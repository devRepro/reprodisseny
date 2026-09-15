<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
import AppButton from "@/components/shared/button/AppButton.vue";

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
    variant?: "default" | "commercial";
    showPrimaryCta?: boolean;
    showSecondaryCta?: boolean;
    primaryCta?: Partial<HeroCta> | null;
    secondaryCta?: Partial<HeroCta> | null;
    class?: string;
    containerClass?: string;
  }>(),
  {
    variant: "default",
    showPrimaryCta: true,
    showSecondaryCta: true,
    primaryCta: () => ({ label: "Pedir presupuesto", to: "/contacto" }),
    secondaryCta: () => ({ label: "Ver productos", to: "#productos" }),
    class: "",
    containerClass: "",
  }
);

const isCommercial = computed(() => props.variant === "commercial");

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

const headerClass = computed(() =>
  cn(
    "relative w-full overflow-hidden bg-background",
    isCommercial.value
      ? "pt-4 pb-10 md:pt-6 md:pb-12 lg:pt-8 lg:pb-16"
      : "pt-4 pb-8 md:pt-6 md:pb-10 lg:pt-8 lg:pb-12",
    props.class
  )
);

const gridClass = computed(() =>
  cn(
    "grid items-center",
    isCommercial.value
      ? "gap-8 md:gap-10 lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.82fr)] lg:gap-14"
      : "gap-7 md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.68fr)] lg:gap-12"
  )
);

const titleClass = computed(() =>
  cn(
    "section-title section-title--hero",
    isCommercial.value ? "max-w-[15ch]" : "max-w-[18ch]"
  )
);

const descriptionClass = computed(() =>
  cn(
    "mt-4 max-w-[62ch] text-pretty text-body text-foreground/74",
    isCommercial.value ? "md:text-[1.0625rem] md:leading-8" : ""
  )
);

const mediaWrapperClass = computed(() =>
  cn(
    "relative mx-auto w-full",
    isCommercial.value
      ? isLowResolutionImage.value
        ? "max-w-[420px]"
        : "max-w-[560px]"
      : isLowResolutionImage.value
        ? "max-w-[420px]"
        : "max-w-[520px]"
  )
);

const mediaFrameClass = computed(() =>
  cn(
    "relative overflow-hidden bg-card",
    isCommercial.value
      ? "rounded-lg border border-border/60"
      : "rounded-[28px] border border-border/70"
  )
);

const imageClass = computed(() =>
  cn(
    "w-full object-cover",
    isCommercial.value
      ? "aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/3]"
      : "aspect-[16/8] sm:aspect-[16/10]"
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
  <header :class="headerClass">
    <div
      v-if="!isCommercial"
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[linear-gradient(180deg,hsl(var(--brand-base-light)/0.48)_0%,hsl(var(--background))_72%)]"
    />

    <div
      v-if="!isCommercial"
      aria-hidden="true"
      class="pointer-events-none absolute left-0 top-16 hidden h-72 w-72 rounded-full bg-[hsl(var(--brand-base-light)/0.55)] blur-3xl lg:block"
    />

    <div :class="cn('container-content relative z-10', props.containerClass)">
      <div :class="gridClass">
        <div class="min-w-0">
          <p
            class="mb-4 inline-flex w-fit items-center gap-2 text-label-s font-semibold uppercase tracking-[0.22em] text-primary/80"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            {{ kicker }}
          </p>

          <h1 :class="titleClass">
            {{ title }}
          </h1>

          <p
            v-if="description"
            :class="descriptionClass"
          >
            {{ description }}
          </p>

          <ul
            v-if="highlights.length"
            class="mt-5 flex flex-wrap gap-2"
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
            class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <AppButton
              v-if="showPrimaryCta && primaryCta"
              :to="primaryCta.to"
              size="lg"
            >
              {{ primaryCta.label }}
            </AppButton>

            <AppButton
              v-if="showSecondaryCta && secondaryCta"
              :to="secondaryCta.to"
              variant="outline"
              size="lg"
            >
              {{ secondaryCta.label }}
            </AppButton>
          </div>
        </div>

        <div v-if="imgSrc" class="relative min-w-0 lg:justify-self-end">
          <figure :class="mediaWrapperClass">
            <div :class="mediaFrameClass">
              <img
                :src="imgSrc"
                :alt="imgAlt"
                :width="imgWidth"
                :height="imgHeight"
                :class="imageClass"
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
              v-if="!isCommercial"
              aria-hidden="true"
              class="absolute -bottom-4 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            />
          </figure>
        </div>
      </div>
    </div>
  </header>
</template>
