<!-- components/marketing/ClientLogosBand.vue -->
<script setup lang="ts">
import { computed } from "vue";

type Logo = {
  src: string;
  alt: string;
  href?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    intro?: string;
    logos: Logo[];
    maxItems?: number;
    logoBoxHeight?: "sm" | "md" | "lg";
    headingAlign?: "left" | "center";
  }>(),
  {
    title: "Clientes que confían en nosotros",
    intro: "",
    maxItems: 12,
    logoBoxHeight: "md",
    headingAlign: "left",
  }
);

const displayed = computed(() => {
  if (!Array.isArray(props.logos)) return [];
  return props.logos.filter(Boolean).slice(0, props.maxItems);
});

const boxH = computed(() => {
  switch (props.logoBoxHeight) {
    case "sm":
      return "min-h-[52px] sm:min-h-[56px]";
    case "lg":
      return "min-h-[72px] sm:min-h-[80px]";
    default:
      return "min-h-[60px] sm:min-h-[68px]";
  }
});

const headingWrapClass = computed(() =>
  props.headingAlign === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"
);

const headingLineClass = computed(() =>
  props.headingAlign === "center"
    ? "mx-auto mt-4 h-px w-20 bg-black/10"
    : "mt-4 h-px w-20 bg-black/10"
);
</script>

<template>
  <section class="bg-brand-bg-2">
    <div class="container-wide py-12 md:py-16 lg:py-20">
      <div :class="headingWrapClass">
        <h2 class="text-3xl font-semibold leading-tight text-foreground md:text-4xl">
          {{ props.title }}
        </h2>

        <div :class="headingLineClass" />

        <p
          v-if="props.intro"
          class="mt-4 text-base leading-7 text-muted-foreground md:text-lg md:leading-8"
        >
          {{ props.intro }}
        </p>
      </div>

      <div
        class="mt-8 overflow-hidden rounded-2xl border border-black/5 bg-white/85 shadow-sm backdrop-blur-sm md:mt-10 md:rounded-3xl"
      >
        <ul
          class="grid grid-cols-2 divide-x divide-y divide-black/5 sm:grid-cols-3 xl:grid-cols-6"
        >
          <li v-for="logo in displayed" :key="`${logo.src}-${logo.alt}`" class="flex">
            <component
              :is="logo.href ? 'a' : 'div'"
              :href="logo.href"
              :target="logo.href ? '_blank' : undefined"
              :rel="logo.href ? 'noopener noreferrer' : undefined"
              class="flex w-full items-center justify-center px-4 py-5 sm:px-5 sm:py-6"
              :class="logo.href ? 'transition-colors hover:bg-black/[0.02]' : ''"
            >
              <div
                class="flex w-full max-w-[170px] items-center justify-center"
                :class="boxH"
              >
                <NuxtImg
                  :src="logo.src"
                  :alt="logo.alt"
                  class="max-h-full w-auto max-w-full object-contain"
                  sizes="(min-width: 1280px) 170px, (min-width: 640px) 160px, 140px"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </component>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
