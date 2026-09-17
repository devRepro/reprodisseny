<script setup lang="ts">
import { computed, type Component } from "vue";
import { CalendarDays, Printer, Tags } from "lucide-vue-next";
import type { RouteLocationRaw } from "vue-router";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
import AppButton from "@/components/shared/button/AppButton.vue";

type LinkTarget = string | RouteLocationRaw;
type CampaignBenefitIcon = "calendar" | "design" | "production";

type CampaignBenefit = {
  icon: CampaignBenefitIcon;
  title: string;
  description: string;
};

const BENEFIT_ICONS: Record<CampaignBenefitIcon, Component> = {
  calendar: CalendarDays,
  design: Tags,
  production: Printer,
};

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    imageSrc: string;
    imageAlt?: string;
    imageSrcset?: string;
    imageAvifSrcset?: string;
    imageSizes?: string;
    imageWidth?: number;
    imageHeight?: number;
    benefits?: CampaignBenefit[];
    primaryLabel?: string;
    primaryTo?: LinkTarget;
    sectionClass?: string;
    eager?: boolean;
  }>(),
  {
    imageAlt: "",
    imageSrcset: "",
    imageAvifSrcset: "",
    imageSizes: "",
    imageWidth: undefined,
    imageHeight: undefined,
    benefits: () => [],
    primaryLabel: "Ver calendarios 2027",
    primaryTo: "/calendarios/calendarios-corporativos-2027#quote-form",
    sectionClass: "",
    eager: false,
  },
);

const resolvedImageSrc = computed(() => {
  const value = String(props.imageSrc || "").trim();
  if (!value) return "";

  return normalizeCmsMediaSrc(value) || value;
});

const resolvedImageAlt = computed(() => {
  return String(props.imageAlt || "").trim() || props.title;
});

const displayBenefits = computed(() =>
  (props.benefits || [])
    .map((item) => ({
      icon: BENEFIT_ICONS[item.icon] || CalendarDays,
      title: String(item.title || "").trim(),
      description: String(item.description || "").trim(),
    }))
    .filter((item) => item.title && item.description),
);
</script>

<template>
  <section
    :class="['campaign-banner campaign-banner--calendar', sectionClass]"
    aria-labelledby="calendar-home-banner-title"
  >
    <div class="campaign-banner__grid">
      <div class="campaign-banner__media">
        <picture v-if="resolvedImageSrc" class="campaign-banner__picture">
          <source
            v-if="imageAvifSrcset"
            type="image/avif"
            :srcset="imageAvifSrcset"
            :sizes="imageSizes || undefined"
          />

          <img
            :src="resolvedImageSrc"
            :srcset="imageSrcset || undefined"
            :sizes="imageSrcset ? imageSizes || undefined : undefined"
            :alt="resolvedImageAlt"
            :width="imageWidth"
            :height="imageHeight"
            class="campaign-banner__image"
            :loading="eager ? 'eager' : 'lazy'"
            decoding="async"
            :fetchpriority="eager ? 'high' : 'auto'"
          />
        </picture>
      </div>

      <div class="campaign-banner__content">
        <div class="campaign-banner__main">
          <h2 id="calendar-home-banner-title" class="campaign-banner__title">
            {{ title }}
          </h2>

          <p class="campaign-banner__description">
            {{ description }}
          </p>

          <AppButton
            :to="primaryTo"
            variant="secondary"
            size="lg"
            class="campaign-banner__cta"
          >
            {{ primaryLabel }}
          </AppButton>
        </div>

        <ul v-if="displayBenefits.length" class="campaign-banner__benefits" role="list">
          <li v-for="benefit in displayBenefits" :key="benefit.title" class="campaign-banner__benefit">
            <span class="campaign-banner__benefit-icon" aria-hidden="true">
              <component :is="benefit.icon" />
            </span>
            <span class="campaign-banner__benefit-copy">
              <span class="campaign-banner__benefit-title">{{ benefit.title }}</span>
              <span class="campaign-banner__benefit-description">{{ benefit.description }}</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
