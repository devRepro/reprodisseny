<script setup lang="ts">
import { computed } from "vue";

export type ProcessStepItem = {
  title: string;
  description: string;
  label?: string;
};

export type ProcessStepsCta = {
  title: string;
  description?: string;
  buttonLabel?: string;
  href?: string;
};

const props = withDefaults(
  defineProps<{
    steps?: ProcessStepItem[];
    cta?: ProcessStepsCta | null;
    gridClass?: string;
    cardClass?: string;
  }>(),
  {
    steps: () => [],
    cta: null,
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

const hasCta = computed(
  () => !!props.cta?.title?.trim() || !!props.cta?.description?.trim()
);
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <ol
      v-if="normalizedSteps.length"
      :class="[
        'grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5',
        gridClass,
      ]"
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

    <div
      v-if="hasCta"
      class="rounded-[28px] border border-primary/15 bg-primary/5 p-6 md:p-7"
    >
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div class="max-w-3xl space-y-2">
          <h3 v-if="cta?.title" class="font-h4 text-foreground">
            {{ cta.title }}
          </h3>

          <p
            v-if="cta?.description"
            class="text-body leading-[1.7] text-muted-foreground text-pretty"
          >
            {{ cta.description }}
          </p>
        </div>

        <NuxtLink
          v-if="cta?.href && cta?.buttonLabel"
          :to="cta.href"
          class="inline-flex min-h-11 items-center justify-center rounded-full border border-primary/20 bg-background px-5 py-2.5 text-body-s-bold text-foreground transition-colors hover:bg-accent"
        >
          {{ cta.buttonLabel }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>