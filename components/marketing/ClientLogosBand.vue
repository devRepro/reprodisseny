<!-- components/marketing/ClientLogosBand.vue -->
<script setup lang="ts">
import { computed, ref } from "vue";

type Logo = {
  src?: string;
  alt?: string;
  href?: string;
};

type DisplayLogo = {
  src: string;
  alt: string;
  href?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    intro?: string;
    eyebrow?: string;
    logos?: Logo[];
    maxItems?: number;
    logoBoxHeight?: "sm" | "md" | "lg";
    headingAlign?: "left" | "center";
  }>(),
  {
    title: "Clientes que confían en nosotros",
    intro: "",
    eyebrow: "Empresas y proyectos",
    logos: () => [],
    maxItems: 12,
    logoBoxHeight: "md",
    headingAlign: "left",
  },
);

const headingId = "client-logos-title";

const failedLogoKeys = ref<Set<string>>(new Set());

function normalizeLogoSrc(src: string) {
  const value = src.trim();

  if (!value) return "";

  /**
   * Permite que, si por error llega "public/clientes/logo.svg",
   * lo convierta en "/clientes/logo.svg".
   */
  if (value.startsWith("public/")) {
    return `/${value.replace(/^public\/+/, "")}`;
  }

  return value;
}

const displayed = computed<DisplayLogo[]>(() => {
  return props.logos
    .map((logo) => {
      const src = normalizeLogoSrc(logo.src ?? "");
      const alt = (logo.alt ?? "").trim();

      return {
        src,
        alt,
        href: logo.href?.trim() || undefined,
      };
    })
    .filter((logo) => Boolean(logo.src && logo.alt))
    .slice(0, props.maxItems);
});

const headingWrapClass = computed(() =>
  props.headingAlign === "center"
    ? "mx-auto max-w-3xl text-center"
    : "max-w-3xl",
);

const dividerClass = computed(() =>
  props.headingAlign === "center"
    ? "section-divider section-divider--center mt-4"
    : "section-divider mt-4 max-w-xs",
);

const tileHeightClass = computed(() => {
  switch (props.logoBoxHeight) {
    case "sm":
      return "min-h-[96px] sm:min-h-[104px]";
    case "lg":
      return "min-h-[124px] sm:min-h-[136px]";
    default:
      return "min-h-[108px] sm:min-h-[118px]";
  }
});

const imageHeightClass = computed(() => {
  switch (props.logoBoxHeight) {
    case "sm":
      return "max-h-9 sm:max-h-10";
    case "lg":
      return "max-h-14 sm:max-h-16";
    default:
      return "max-h-11 sm:max-h-12";
  }
});

function logoKey(logo: DisplayLogo, index: number) {
  return `${logo.src}-${logo.alt}-${index}`;
}

function isLogoFailed(logo: DisplayLogo, index: number) {
  return failedLogoKeys.value.has(logoKey(logo, index));
}

function markLogoAsFailed(logo: DisplayLogo, index: number) {
  const next = new Set(failedLogoKeys.value);
  next.add(logoKey(logo, index));
  failedLogoKeys.value = next;
}
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
        class="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-background/35 blur-3xl"
      />

      <div
        class="absolute right-[-10rem] top-8 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />

      <div
        class="absolute bottom-[-12rem] left-1/4 h-96 w-96 rounded-full bg-background/30 blur-3xl"
      />

      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--background)/0.32),transparent_44%)]"
      />
    </div>

    <div class="container-wide relative py-12 md:py-16 lg:py-20">
      <div :class="headingWrapClass">
        <p v-if="props.eyebrow" class="section-eyebrow">
          {{ props.eyebrow }}
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

      <ul
        class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-6"
        role="list"
      >
        <li
          v-for="(logo, index) in displayed"
          :key="logoKey(logo, index)"
          class="min-w-0 list-none"
        >
          <component
            :is="logo.href ? 'a' : 'div'"
            :href="logo.href"
            :target="logo.href ? '_blank' : undefined"
            :rel="logo.href ? 'noopener noreferrer' : undefined"
            :title="logo.alt"
            class="group flex w-full items-center justify-center rounded-2xl border border-border/70 bg-card/90 px-5 py-6 shadow-sm outline-none backdrop-blur-sm transition duration-200 focus-visible:ring-2 focus-visible:ring-primary/25"
            :class="[
              tileHeightClass,
              logo.href
                ? 'hover:-translate-y-0.5 hover:border-primary/30 hover:bg-background hover:shadow-md'
                : '',
            ]"
          >
            <img
              v-if="!isLogoFailed(logo, index)"
              :src="logo.src"
              :alt="logo.alt"
              class="w-auto max-w-[150px] object-contain opacity-90 transition duration-200 group-hover:opacity-100 sm:max-w-[165px]"
              :class="imageHeightClass"
              loading="lazy"
              decoding="async"
              @error="markLogoAsFailed(logo, index)"
            />

            <span
              v-else
              class="max-w-[150px] text-center text-sm font-semibold leading-snug text-foreground/75 sm:max-w-[165px]"
            >
              {{ logo.alt }}
            </span>
          </component>
        </li>
      </ul>
    </div>
  </section>
</template>