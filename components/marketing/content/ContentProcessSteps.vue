<script setup lang="ts">
import { computed } from "vue";

export type ProcessStepItem = {
  title: string;
  description: string;
  label?: string;
};

const props = withDefaults(
  defineProps<{
    steps?: ProcessStepItem[];
    gridClass?: string;
    cardClass?: string;
  }>(),
  {
    steps: () => [],
    gridClass: "",
    cardClass: "",
  }
);

const normalizedSteps = computed(() =>
  (props.steps || [])
    .filter((step) => step?.title?.trim() && step?.description?.trim())
    .map((step, index) => ({
      ...step,
      label: step.label?.trim() || String(index + 1).padStart(2, "0"),
    }))
);
</script>

<template>
  <ol
    v-if="normalizedSteps.length"
    :class="['grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5', gridClass]"
  >
    <li
      v-for="(step, index) in normalizedSteps"
      :key="`${step.label}-${index}-${step.title}`"
      :class="[
        'catalog-panel group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card p-6 shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_18px_40px_-26px_hsl(var(--foreground)/0.16)]',
        cardClass,
      ]"
    >
      <div
        class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
        aria-hidden="true"
      />

      <div class="flex items-center gap-3">
        <span
          class="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-primary/15 bg-primary/8 px-3 text-body-s-bold text-primary"
        >
          {{ step.label }}
        </span>

        <span class="h-px flex-1 bg-border/80" />
      </div>

      <div class="mt-6 flex flex-1 flex-col">
        <h3 class="font-h4 text-foreground text-balance">
          {{ step.title }}
        </h3>

        <p class="mt-3 text-body-s leading-[1.7] text-muted-foreground text-pretty">
          {{ step.description }}
        </p>
      </div>
    </li>
  </ol>
</template>
