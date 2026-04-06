<script setup lang="ts">
import { computed } from "vue";
import { Card, CardContent } from "@/components/ui/card";

export type ProcessStep = {
  title?: string; // Hecho opcional para que coincida con la captura
  description: string;
  label?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    steps?: ProcessStep[];
    introClass?: string;
    gridClass?: string;
    cardClass?: string;
  }>(),
  {
    title: "",
    description: "",
    steps: () => [],
    introClass: "",
    gridClass: "",
    cardClass: "",
  }
);

function isGenericStepTitle(value: string) {
  return /^paso\s*\d{1,2}$/i.test(String(value || "").trim());
}

const normalizedSteps = computed(() =>
  (props.steps || [])
    .filter(
      // Ahora solo exige que haya descripción para mostrar el paso
      (step) => String(step?.description || "").trim()
    )
    .map((step, index) => ({
      ...step,
      cleanTitle:
        step.title && isGenericStepTitle(step.title) ? "" : step.title?.trim() || "",
      number: String(index + 1).padStart(2, "0"),
    }))
);
</script>

<template>
  <section v-if="normalizedSteps.length" class="w-full">
    <div v-if="title || description" :class="['mb-8 space-y-3', introClass]">
      <h3
        v-if="title"
        class="text-2xl font-bold tracking-tight text-foreground md:text-3xl"
      >
        {{ title }}
      </h3>

      <p
        v-if="description"
        class="max-w-3xl text-base leading-relaxed text-muted-foreground"
      >
        {{ description }}
      </p>
    </div>

    <div :class="['grid gap-4 md:grid-cols-2 lg:gap-6', gridClass]">
      <Card
        v-for="step in normalizedSteps"
        :key="`${step.number}-${step.cleanTitle}`"
        :class="[
          'overflow-hidden rounded-2xl border border-border/60 bg-card shadow-none transition-all duration-200 hover:border-primary/20 hover:bg-accent/5',
          cardClass,
        ]"
      >
        <CardContent class="p-5 sm:p-6">
          <div class="flex items-start gap-5">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-primary sm:h-12 sm:w-12"
            >
              {{ step.number }}
            </div>

            <div class="flex flex-col pt-1 sm:pt-1.5">
              <h4
                v-if="step.cleanTitle"
                class="mb-1.5 text-base font-semibold leading-none text-foreground md:text-lg"
              >
                {{ step.cleanTitle }}
              </h4>

              <p class="text-sm leading-relaxed text-muted-foreground md:text-base">
                {{ step.description }}
              </p>

              <div v-if="step.label" class="mt-3">
                <span
                  class="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {{ step.label }}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
