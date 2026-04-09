<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";

type ShowcaseImage =
  | {
      src?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | null
  | undefined;

type ShowcaseProduct = {
  title?: string | null;
  slug?: string | null;
  path?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  image?: ShowcaseImage;
  imageSrc?: string | null;
  imageAlt?: string | null;
  badges?: string[] | null;
  formTo?: string | null;
};

type ShowcaseCta = {
  label: string;
  to: string;
};

const props = withDefaults(
  defineProps<{
    product?: ShowcaseProduct | null;
    eyebrow?: string;
    title?: string;
    description?: string;
    badges?: string[];
    highlights?: string[];
    primaryCta?: Partial<ShowcaseCta> | null;
    secondaryCta?: Partial<ShowcaseCta> | null;
    imagePosition?: "left" | "right";
    class?: string;
    cardClass?: string;
  }>(),
  {
    product: null,
    eyebrow: "Producto recomendado",
    title: "",
    description: "",
    badges: () => [],
    highlights: () => [],
    primaryCta: null,
    secondaryCta: null,
    imagePosition: "right",
    class: "",
    cardClass: "",
  }
);

const displayTitle = computed(() => {
  return (
    String(props.title || "").trim() ||
    String(props.product?.title || "").trim() ||
    "Producto recomendado"
  );
});

const displayDescription = computed(() => {
  return (
    String(props.description || "").trim() ||
    String(props.product?.shortDescription || "").trim() ||
    String(props.product?.description || "").trim() ||
    ""
  );
});

const displayBadges = computed(() => {
  const fromProps = Array.isArray(props.badges) ? props.badges : [];
  if (fromProps.length) return fromProps.filter(Boolean);

  const fromProduct = Array.isArray(props.product?.badges)
    ? props.product?.badges || []
    : [];

  return fromProduct.filter(Boolean);
});

const rawImgSrc = computed(
  () => props.product?.imageSrc || props.product?.image?.src || ""
);

const imgSrc = computed(() => normalizeCmsMediaSrc(rawImgSrc.value || "") || "");

const imgAlt = computed(() => {
  return (
    String(props.product?.imageAlt || "").trim() ||
    String(props.product?.image?.alt || "").trim() ||
    displayTitle.value
  );
});

const imgWidth = computed(() => props.product?.image?.width || 1200);
const imgHeight = computed(() => props.product?.image?.height || 900);

const primaryCta = computed<ShowcaseCta | null>(() => {
  const manualTo = String(props.primaryCta?.to || "").trim();
  const manualLabel = String(props.primaryCta?.label || "").trim();

  if (manualTo && manualLabel) {
    return { to: manualTo, label: manualLabel };
  }

  const formTo = String(props.product?.formTo || "").trim();
  const path = String(props.product?.path || "").trim();

  if (formTo) {
    return { to: formTo, label: "Pedir presupuesto" };
  }

  if (path) {
    return { to: path, label: "Ver producto" };
  }

  return null;
});

const secondaryCta = computed<ShowcaseCta | null>(() => {
  const manualTo = String(props.secondaryCta?.to || "").trim();
  const manualLabel = String(props.secondaryCta?.label || "").trim();

  if (manualTo && manualLabel) {
    return { to: manualTo, label: manualLabel };
  }

  const path = String(props.product?.path || "").trim();
  if (!path) return null;

  if (primaryCta.value?.to === path) return null;

  return { to: path, label: "Ver producto" };
});

const mediaOrderClass = computed(() =>
  props.imagePosition === "left" ? "lg:order-1" : "lg:order-2"
);

const contentOrderClass = computed(() =>
  props.imagePosition === "left" ? "lg:order-2" : "lg:order-1"
);
</script>

<template>
  <aside :class="cn('w-full', props.class)">
    <div
      :class="
        cn(
          'relative overflow-hidden rounded-[24px] border border-border/60 bg-card shadow-[0_18px_42px_-28px_hsl(var(--foreground)/0.16)]',
          props.cardClass
        )
      "
    >
      <div aria-hidden="true" class="pointer-events-none absolute inset-0">
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,hsl(var(--brand-base-light)/0.55)_0%,transparent_34%)]"
        />
        <div
          class="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_68%,hsl(var(--accent)/0.18)_100%)]"
        />
      </div>

      <div
        class="relative grid gap-8 px-6 py-6 md:px-8 md:py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:items-center lg:gap-10"
      >
        <div :class="cn('min-w-0 space-y-5', contentOrderClass)">
          <div class="space-y-3">
            <p
              v-if="eyebrow"
              class="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80"
            >
              {{ eyebrow }}
            </p>

            <h3
              class="max-w-[20ch] text-balance text-[clamp(1.6rem,2.8vw,2.4rem)] font-bold leading-[1.08] text-foreground"
            >
              {{ displayTitle }}
            </h3>

            <p
              v-if="displayDescription"
              class="max-w-[62ch] text-base leading-7 text-foreground/78"
            >
              {{ displayDescription }}
            </p>
          </div>

          <div v-if="displayBadges.length" class="flex flex-wrap gap-2">
            <span
              v-for="badge in displayBadges"
              :key="badge"
              class="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"
            >
              {{ badge }}
            </span>
          </div>

          <ul
            v-if="highlights.length"
            class="grid gap-3 text-sm leading-6 text-foreground/78 md:grid-cols-2"
          >
            <li
              v-for="highlight in highlights"
              :key="highlight"
              class="flex items-start gap-3 rounded-2xl border border-border/40 bg-background/70 px-4 py-3"
            >
              <span
                aria-hidden="true"
                class="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary/70 ring-4 ring-primary/10"
              />
              <span>{{ highlight }}</span>
            </li>
          </ul>

          <div
            v-if="primaryCta || secondaryCta"
            class="flex flex-wrap items-center gap-3 pt-1"
          >
            <NuxtLink
              v-if="primaryCta"
              :to="primaryCta.to"
              class="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 py-3 text-body-s-bold text-primary-foreground transition hover:opacity-90"
            >
              {{ primaryCta.label }}
            </NuxtLink>

            <NuxtLink
              v-if="secondaryCta"
              :to="secondaryCta.to"
              class="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-background px-5 py-3 text-body-s-bold text-foreground transition hover:border-primary/25 hover:text-primary"
            >
              {{ secondaryCta.label }}
            </NuxtLink>
          </div>
        </div>

        <div v-if="imgSrc" :class="cn('relative min-w-0', mediaOrderClass)">
          <div
            aria-hidden="true"
            class="absolute inset-x-6 bottom-3 top-6 rounded-[32px] bg-[linear-gradient(135deg,hsl(var(--brand-base-light)/0.9)_0%,hsl(var(--brand-bg-2)/0.5)_45%,hsl(var(--background))_100%)] opacity-90 blur-2xl"
          />

          <div
            class="relative overflow-hidden rounded-[24px] border border-border/60 bg-background shadow-[0_14px_34px_-24px_hsl(var(--foreground)/0.18)]"
          >
            <NuxtImg
              :src="imgSrc"
              :alt="imgAlt"
              :width="imgWidth"
              :height="imgHeight"
              class="aspect-[4/3] h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>