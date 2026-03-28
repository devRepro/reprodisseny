<!-- components/marketing/ClientLogosBand.vue -->
<script setup lang="ts">
import { computed } from "vue";
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";

type Logo = {
  src: string;
  alt: string;
  href?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    logos: Logo[];
    maxItems?: number;
    logoBoxHeight?: "sm" | "md" | "lg";
  }>(),
  {
    title: "Clientes que confían en nosotros",
    maxItems: 12,
    logoBoxHeight: "md",
  }
);

const displayed = computed(() => {
  if (!Array.isArray(props.logos)) return [];
  return props.logos.filter(Boolean).slice(0, props.maxItems);
});

const boxH = computed(() => {
  switch (props.logoBoxHeight) {
    case "sm":
      return "h-10 sm:h-12";
    case "lg":
      return "h-14 sm:h-16";
    default:
      return "h-12 sm:h-14";
  }
});
</script>

<template>
  <section class="bg-brand-bg-2">
    <div class="container-content py-10 sm:py-14 lg:py-16">
      <SectionHeading
        as="h2"
        :title="props.title"
        title-tone="foreground"
        line-tone="foreground"
        class="w-full"
      />

      <ul
        class="mt-10 grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-10 sm:grid-cols-3 lg:mt-12 lg:grid-cols-6"
      >
        <li
          v-for="logo in displayed"
          :key="`${logo.src}-${logo.alt}`"
          class="flex w-full justify-center"
        >
          <component
            :is="logo.href ? 'a' : 'div'"
            :href="logo.href"
            :target="logo.href ? '_blank' : undefined"
            :rel="logo.href ? 'noopener noreferrer' : undefined"
            class="flex w-full justify-center"
            :class="logo.href ? 'transition-opacity hover:opacity-80' : ''"
          >
            <div
              class="flex w-full max-w-[170px] items-center justify-center"
              :class="boxH"
            >
              <NuxtImg
                :src="logo.src"
                :alt="logo.alt"
                class="max-h-full w-auto max-w-full object-contain"
                sizes="(min-width: 1024px) 170px, (min-width: 640px) 160px, 140px"
                loading="lazy"
                decoding="async"
              />
            </div>
          </component>
        </li>
      </ul>
    </div>
  </section>
</template>
