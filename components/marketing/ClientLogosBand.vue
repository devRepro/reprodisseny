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

const headingId = "client-logos-title";

const displayed = computed(() => {
  if (!Array.isArray(props.logos)) return [];

  return props.logos
    .filter((logo): logo is Logo => Boolean(logo?.src && logo?.alt))
    .slice(0, props.maxItems);
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
  props.headingAlign === "center"
    ? "mx-auto max-w-3xl text-center"
    : "max-w-3xl"
);

const dividerClass = computed(() =>
  props.headingAlign === "center"
    ? "section-divider section-divider--center mt-4"
    : "section-divider mt-4 max-w-xs"
);
</script>

<template>
  <section
    v-if="displayed.length"
    class="relative overflow-hidden border-y border-primary/10 bg-brand-bg-2 text-foreground"
    :aria-labelledby="headingId"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        class="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-background/28 blur-3xl"
      />

      <div
        class="absolute right-[-10rem] top-8 h-96 w-96 rounded-full bg-primary/8 blur-3xl"
      />

      <div
        class="absolute bottom-[-12rem] left-1/4 h-96 w-96 rounded-full bg-background/22 blur-3xl"
      />

      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--background)/0.24),transparent_42%)]"
      />
    </div>

    <div class="container-wide relative py-12 md:py-16 lg:py-20">
      <div :class="headingWrapClass">
        <p class="section-eyebrow">
          Empresas y proyectos
        </p>

        <h2
          :id="headingId"
          class="section-title section-title--section section-title--foreground mt-3"
        >
          {{ props.title }}
        </h2>

        <div :class="dividerClass" />

        <p
          v-if="props.intro"
          class="section-subtitle mt-4"
          :class="props.headingAlign === 'center' && 'section-subtitle--center'"
        >
          {{ props.intro }}
        </p>
      </div>

      <div
  class="mt-8 overflow-hidden rounded-[28px] border border-border/60 bg-card shadow-[0_18px_50px_-36px_hsl(var(--foreground)/0.26)] md:mt-10"
>
  <ul
    class="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-3 xl:grid-cols-6"
    role="list"
  >
          <li
            v-for="logo in displayed"
            :key="`${logo.src}-${logo.alt}`"
            class="flex min-w-0 list-none"
          >
            <component
              :is="logo.href ? 'a' : 'div'"
              :href="logo.href"
              :target="logo.href ? '_blank' : undefined"
              :rel="logo.href ? 'noopener noreferrer' : undefined"
              class="group flex w-full items-center justify-center px-4 py-5 outline-none transition-colors focus-visible:bg-accent/45 focus-visible:ring-2 focus-visible:ring-primary/20 sm:px-5 sm:py-6"
:class="logo.href ? 'hover:bg-accent/30' : ''"
            >
              <div
                class="flex w-full max-w-[170px] items-center justify-center"
                :class="boxH"
              >
                <NuxtImg
                  :src="logo.src"
                  :alt="logo.alt"
                  class="max-h-full w-auto max-w-full object-contain  transition duration-200"
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