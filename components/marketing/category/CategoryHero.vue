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
    "category-hero",
    isCommercial.value ? "category-hero--commercial" : "category-hero--default",
    props.class
  )
);

const gridClass = computed(() =>
  cn(
    "category-hero__grid",
    isCommercial.value ? "category-hero__grid--commercial" : "category-hero__grid--default"
  )
);

const titleClass = computed(() =>
  cn(
    "category-hero__title",
    isCommercial.value ? "category-hero__title--commercial" : "category-hero__title--default"
  )
);

const descriptionClass = computed(() =>
  cn(
    "category-hero__description",
    isCommercial.value && "category-hero__description--commercial"
  )
);

const mediaWrapperClass = computed(() =>
  cn(
    "category-hero__media-wrapper",
    isLowResolutionImage.value && "category-hero__media-wrapper--low-resolution"
  )
);

const mediaFrameClass = computed(() =>
  cn(
    "category-hero__media-frame",
    "media-frame",
    "media-frame--editorial",
    isCommercial.value ? "category-hero__media-frame--commercial" : "category-hero__media-frame--default"
  )
);

const imageClass = computed(() =>
  cn(
    "category-hero__image",
    isCommercial.value ? "category-hero__image--commercial" : "category-hero__image--default"
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
      class="category-hero__wash"
    />

    <div
      v-if="!isCommercial"
      aria-hidden="true"
      class="category-hero__glow"
    />

    <div :class="cn('container-content relative z-10', props.containerClass)">
      <div :class="gridClass">
        <div class="category-hero__content">
          <p
            class="category-hero__kicker"
          >
            <span class="category-hero__kicker-dot" aria-hidden="true" />
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
            class="category-hero__highlights"
            aria-label="Puntos destacados de la categoría"
          >
            <li
              v-for="item in highlights"
              :key="item"
              class="category-hero__highlight"
            >
              {{ item }}
            </li>
          </ul>

          <div
            v-if="(showPrimaryCta && primaryCta) || (showSecondaryCta && secondaryCta)"
            class="category-hero__actions"
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

        <div v-if="imgSrc" class="category-hero__media">
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
                class="category-hero__media-ring"
              />
            </div>

            <div
              v-if="!isCommercial"
              aria-hidden="true"
              class="category-hero__media-line"
            />
          </figure>
        </div>
      </div>
    </div>
  </header>
</template>
