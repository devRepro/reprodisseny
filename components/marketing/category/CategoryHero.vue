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
        'relative w-full overflow-hidden',
        'bg-[linear-gradient(180deg,hsl(var(--brand-base-light)/0.42)_0%,hsl(var(--background))_58%,hsl(var(--background))_100%)]',
        'pt-6 md:pt-8 lg:pt-10',
        'pb-8 md:pb-10 lg:pb-12',
        props.class
      )
    "
  >
    <div aria-hidden="true" class="pointer-events-none absolute inset-0">
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,hsl(var(--brand-base-light)/0.95)_0%,transparent_36%)]"
      />
      <div
        class="absolute right-[-6%] top-[8%] h-[320px] w-[320px] rounded-full bg-[hsl(var(--brand-bg-2)/0.48)] blur-3xl md:h-[420px] md:w-[420px]"
      />
      <div
        class="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--border)),transparent)]"
      />
    </div>

    <div :class="cn('container-content relative z-10', props.containerClass)">
      <div
        class="grid items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] lg:gap-12"
      >
        <div class="min-w-0">
          <p
            class="mb-4 inline-flex w-fit items-center rounded-full border border-primary/15 bg-background/80 px-3 py-1.5 text-label text-primary shadow-sm backdrop-blur"
          >
            {{ kicker }}
          </p>

          <h1
            class="max-w-[16ch] text-[clamp(2.2rem,4vw,4.2rem)] font-bold leading-[1.02] tracking-[-0.02em] text-foreground"
          >
            {{ title }}
          </h1>

          <p
            v-if="description"
            class="mt-5 max-w-[64ch] text-body text-foreground/82 md:text-[18px] md:leading-[1.7]"
          >
            {{ description }}
          </p>

          <ul
            v-if="highlights.length"
            class="mt-6 flex flex-wrap gap-2.5"
            aria-label="Puntos destacados de la categoría"
          >
            <li
              v-for="item in highlights"
              :key="item"
              class="inline-flex items-center rounded-full border border-border bg-background/88 px-3 py-1.5 text-body-xs text-foreground/80 shadow-sm"
            >
              {{ item }}
            </li>
          </ul>

          <div
            v-if="(showPrimaryCta && primaryCta) || (showSecondaryCta && secondaryCta)"
            class="mt-8 flex flex-wrap items-center gap-3"
          >
            <NuxtLink
              v-if="showPrimaryCta && primaryCta"
              :to="primaryCta.to"
              class="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-body-s-bold text-primary-foreground shadow-[0_10px_24px_-14px_hsl(var(--primary)/0.55)] transition hover:translate-y-[-1px] hover:opacity-95"
            >
              {{ primaryCta.label }}
            </NuxtLink>

            <NuxtLink
              v-if="showSecondaryCta && secondaryCta"
              :to="secondaryCta.to"
              class="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-background/90 px-5 py-3 text-body-s-bold text-foreground transition hover:border-primary/25 hover:bg-background hover:text-primary"
            >
              {{ secondaryCta.label }}
            </NuxtLink>
          </div>
        </div>

        <div v-if="imgSrc" class="relative min-w-0">
          <div
            aria-hidden="true"
            class="absolute inset-x-10 bottom-[-14px] top-8 rounded-[34px] bg-[linear-gradient(135deg,hsl(var(--brand-base-light)/0.95)_0%,hsl(var(--brand-bg-2)/0.7)_48%,hsl(var(--background))_100%)] blur-2xl"
          />

          <div
            aria-hidden="true"
            class="absolute -right-3 -top-3 hidden h-full w-full rounded-[32px] border border-primary/10 bg-background/50 lg:block"
          />

          <div
            class="relative overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_20px_55px_-28px_hsl(var(--foreground)/0.22)]"
          >
            <div
              aria-hidden="true"
              class="absolute inset-x-0 top-0 z-[1] h-24 bg-[linear-gradient(180deg,hsl(var(--foreground)/0.06)_0%,transparent_100%)]"
            />

            <img
              :src="imgSrc"
              :alt="imgAlt"
              :width="imgWidth"
              :height="imgHeight"
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
