<script setup lang="ts">
import { computed } from "vue";
import { Check } from "lucide-vue-next";
import type { RouteLocationRaw } from "vue-router";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
import AppButton from "@/components/shared/button/AppButton.vue";

type LinkTarget = string | RouteLocationRaw;

const props = withDefaults(
  defineProps<{
    title: string;
    imageSrc: string;
    imageAlt?: string;
    bullets?: string[];
    primaryLabel?: string;
    primaryTo?: LinkTarget;
    secondaryLabel?: string;
    secondaryTo?: LinkTarget | null;
    heightClass?: string;
    imagePosition?: string;
    sectionClass?: string;
    eager?: boolean;
  }>(),
  {
    imageAlt: "",
    bullets: () => [],
    primaryLabel: "Solicitar presupuesto",
    primaryTo: "/lp/laminas-solares#quote-form",
    secondaryLabel: "Te respondemos en menos de 24h laborales",
    secondaryTo: "/lp/laminas-solares#quote-form",
    heightClass: "h-auto lg:h-[300px]",
    imagePosition: "center center",
    sectionClass: "",
    eager: false,
  }
);

const resolvedImageSrc = computed(() => {
  const value = String(props.imageSrc || "").trim();
  if (!value) return "";

  return normalizeCmsMediaSrc(value) || value;
});

const resolvedImageAlt = computed(() => {
  return String(props.imageAlt || "").trim() || props.title;
});

const displayBullets = computed(() =>
  (props.bullets || [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
);

const resolvedSecondaryTo = computed(() => props.secondaryTo || null);

const hasSecondaryAction = computed(() =>
  Boolean(props.secondaryLabel?.trim() && resolvedSecondaryTo.value)
);
</script>

<template>
  <section
    :class="[
      'relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-primary text-primary-foreground',
      sectionClass,
    ]"
  >
    <div
      :class="[
        'grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
        heightClass,
      ]"
    >
      <div class="relative h-[220px] overflow-hidden bg-muted sm:h-[260px] lg:h-full">
        <img
          v-if="resolvedImageSrc"
          :src="resolvedImageSrc"
          :alt="resolvedImageAlt"
          class="absolute inset-0 h-full w-full object-cover"
          :style="{ objectPosition: imagePosition }"
          :loading="eager ? 'eager' : 'lazy'"
          decoding="async"
          :fetchpriority="eager ? 'high' : 'auto'"
        />
      </div>

      <div
        class="flex bg-primary px-6 py-8 text-primary-foreground sm:px-10 lg:h-full lg:items-center lg:px-14 lg:py-0 xl:px-16"
      >
        <div class="w-full max-w-[680px]">
          <div class="space-y-5">
            <h2
              class="text-balance text-[32px] font-bold leading-[1.12] tracking-tight text-primary-foreground md:text-[36px]"
            >
              {{ title }}
            </h2>

            <ul
              v-if="displayBullets.length"
              class="space-y-2.5 text-[18px] font-medium leading-snug text-primary-foreground/95 md:text-[20px]"
            >
              <li
                v-for="bullet in displayBullets"
                :key="bullet"
                class="flex items-start gap-2.5"
              >
                <Check
                  class="mt-0.5 h-5 w-5 shrink-0 text-primary-foreground"
                  stroke-width="3"
                  aria-hidden="true"
                />

                <span>{{ bullet }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <AppButton
              :to="primaryTo"
              variant="secondary"
              size="lg"
              arrow
              class="rounded-xl bg-[hsl(var(--brand-yellow))] text-foreground hover:bg-[hsl(var(--brand-yellow)/0.88)]"
            >
              {{ primaryLabel }}
            </AppButton>

            <AppButton
              v-if="hasSecondaryAction"
              :to="resolvedSecondaryTo"
              variant="link"
              size="lg"
              class="text-primary-foreground/90 underline underline-offset-4 hover:text-primary-foreground"
            >
              {{ secondaryLabel }}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>