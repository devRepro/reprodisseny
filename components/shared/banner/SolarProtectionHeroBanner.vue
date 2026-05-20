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
    secondaryLabel: "Respuesta en menos de 24h laborales",
    secondaryTo: "/lp/laminas-solares#quote-form",

    // Banner secundario: no debe competir con el hero principal de la home.
    heightClass: "h-auto lg:h-[356px]",

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
      'relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-[hsl(var(--brand-base-dark))] text-primary-foreground',
      sectionClass,
    ]"
  >
    <div :class="['grid lg:grid-cols-[42%_58%]', heightClass]">
      <div class="relative h-[250px] overflow-hidden bg-muted sm:h-[310px] lg:h-full">
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

        <div
          aria-hidden="true"
          class="absolute inset-y-0 right-0 hidden w-20 bg-gradient-to-l from-[hsl(var(--brand-base-dark))] to-transparent lg:block"
        />
      </div>

      <div
        class="flex bg-[hsl(var(--brand-base-dark))] px-6 py-9 text-primary-foreground sm:px-10 lg:h-full lg:items-center lg:px-12 lg:py-0 xl:pl-14 xl:pr-20"
      >
        <div class="w-full max-w-[720px]">
          <div class="space-y-5">
            <h2
              class="m-0 max-w-3xl text-balance text-[clamp(2rem,3.1vw,2.55rem)] font-bold leading-[1.08] tracking-[-0.035em] text-primary-foreground"
            >
              {{ title }}
            </h2>

            <ul
              v-if="displayBullets.length"
              class="space-y-2.5 text-[clamp(1.05rem,1.45vw,1.22rem)] font-medium leading-relaxed text-primary-foreground/95"
            >
              <li
                v-for="bullet in displayBullets"
                :key="bullet"
                class="flex items-start gap-3"
              >
                <Check
                  class="mt-[0.24em] size-5 shrink-0 text-primary-foreground/95"
                  stroke-width="2.8"
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
              class="!h-12 !rounded-[9px] !bg-[hsl(var(--brand-yellow))] !px-5 !text-[17px] !font-semibold !leading-none !text-foreground shadow-none hover:!bg-[hsl(var(--brand-yellow)/0.9)] focus-visible:!ring-2 focus-visible:!ring-primary-foreground/45"
            >
              {{ primaryLabel }}
            </AppButton>

            <AppButton
              v-if="hasSecondaryAction"
              :to="resolvedSecondaryTo"
              variant="link"
              size="lg"
              class="!h-auto !px-0 !text-sm !font-medium !leading-none text-primary-foreground/78 underline underline-offset-[4px] hover:text-primary-foreground"
            >
              {{ secondaryLabel }}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>