<script setup lang="ts">
import { computed } from "vue";
import { Card, CardContent } from "@/components/ui/card";

export type ProcessStep = {
  title: string;
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
      (step) => String(step?.title || "").trim() && String(step?.description || "").trim()
    )
    .map((step, index) => ({
      ...step,
      cleanTitle: isGenericStepTitle(step.title) ? "" : step.title.trim(),
      number: String(index + 1).padStart(2, "0"),
    }))
);
</script>

<template>
  <section v-if="normalizedSteps.length" class="w-full">
    <div v-if="title || description" :class="['space-y-2', introClass]">
      <h3
        v-if="title"
        class="text-xl font-semibold leading-tight text-foreground md:text-2xl"
      >
        {{ title }}
      </h3>

      <p
        v-if="description"
        class="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base"
      >
        {{ description }}
      </p>
    </div>

    <div :class="['grid gap-3 md:grid-cols-2', gridClass]">
      <Card
        v-for="step in normalizedSteps"
        :key="`${step.number}-${step.title}`"
        :class="[
          'rounded-2xl border border-border/60 bg-background shadow-none',
          cardClass,
        ]"
      >
        <CardContent class="p-4 md:p-5">
          <div class="flex items-start gap-4">
            <div
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
            >
              {{ step.number }}
            </div>

            <div class="min-w-0 space-y-1.5">
              <h4
                v-if="step.cleanTitle"
                class="text-sm font-semibold leading-6 text-foreground md:text-base"
              >
                {{ step.cleanTitle }}
              </h4>

              <p class="text-sm leading-6 text-muted-foreground md:text-[15px]">
                {{ step.description }}
              </p>

              <div v-if="step.label" class="pt-1">
                <span
                  class="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
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
