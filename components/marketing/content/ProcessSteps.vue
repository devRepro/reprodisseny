<script setup lang="ts">
import { computed, type Component, type PropType } from "vue";
import {
  ClipboardList,
  FileCheck2,
  SwatchBook,
  Printer,
} from "lucide-vue-next";

export type ProcessStep = {
  title: string;
  description: string;
  label?: string;
  icon?: Component;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    steps?: ProcessStep[];
    introClass?: string;
    gridClass?: string;
    cardClass?: string;
    showConnector?: boolean;
  }>(),
  {
    title: "Cómo trabajamos",
    description:
      "Te acompañamos en todo el proceso, desde la elección del material hasta la entrega final.",
    steps: () => [],
    introClass: "max-w-3xl",
    gridClass: "",
    cardClass: "",
    showConnector: true,
  }
);

const fallbackIcons: Component[] = [
  ClipboardList,
  FileCheck2,
  SwatchBook,
  Printer,
];

const normalizedSteps = computed(() =>
  (props.steps || [])
    .filter(
      (step) =>
        String(step?.title || "").trim() &&
        String(step?.description || "").trim()
    )
    .map((step, index) => ({
      ...step,
      icon: step.icon || fallbackIcons[index] || ClipboardList,
      number: String(index + 1).padStart(2, "0"),
    }))
);
</script>

<template>
  <section v-if="normalizedSteps.length" class="w-full space-y-6 md:space-y-8">
    <div v-if="title || description" :class="introClass">
      <div class="space-y-3">
        <h3
          v-if="title"
          class="text-[24px] font-semibold leading-[1.2] text-foreground md:text-[28px]"
        >
          {{ title }}
        </h3>

        <p
          v-if="description"
          class="text-base leading-[1.75] text-foreground/72 md:text-[17px]"
        >
          {{ description }}
        </p>
      </div>
    </div>

    <div class="relative">
      <div
        v-if="showConnector && normalizedSteps.length > 1"
        aria-hidden="true"
        class="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[22px] hidden xl:block border-t border-dashed border-border/70"
      />

      <div :class="['grid gap-4 md:grid-cols-2 xl:grid-cols-4', gridClass]">
        <article
          v-for="step in normalizedSteps"
          :key="`${step.number}-${step.title}`"
          :class="[
            'relative rounded-[24px] border border-border/70 bg-card p-5 shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)] md:p-6',
            cardClass,
          ]"
        >
          <div class="mb-5 flex items-start justify-between gap-4">
            <div
              class="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-primary/10 px-3 text-sm font-bold tracking-[0.08em] text-primary"
            >
              {{ step.number }}
            </div>

            <div
              class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-background text-primary"
            >
              <component :is="step.icon" class="h-[18px] w-[18px]" />
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="text-[18px] font-semibold leading-[1.3] text-foreground">
              {{ step.title }}
            </h4>

            <p class="text-sm leading-[1.75] text-foreground/72 md:text-[15px]">
              {{ step.description }}
            </p>

            <div v-if="step.label" class="pt-1">
              <span
                class="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground/70"
              >
                {{ step.label }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
