<script setup lang="ts">
import { computed } from "vue";
import { ArrowRight } from "lucide-vue-next";

type Step = {
  number?: string;
  title: string;
  description: string;
};

const props = withDefaults(
  defineProps<{
    steps?: Step[];
  }>(),
  {
    steps: () => [],
  }
);

const safeSteps = computed(() =>
  props.steps
    .map((step, index) => ({
      number: String(step.number || String(index + 1).padStart(2, "0")).trim(),
      title: String(step.title || "").trim(),
      description: String(step.description || "").trim(),
    }))
    .filter((step) => step.title && step.description)
);
</script>

<template>
  <div
    v-if="safeSteps.length"
    class="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch"
  >
    <template v-for="(step, index) in safeSteps" :key="step.number">
      <article
        class="rounded-[10px] border border-white/10 bg-white/10 p-5 shadow-[0_16px_40px_-30px_rgba(0,0,0,.7)]"
      >
        <p class="text-base font-semibold text-white/90">
          {{ step.number }}
        </p>
        <h3 class="mt-5 text-base font-semibold leading-5 text-white">
          {{ step.title }}
        </h3>
        <p class="mt-2 text-[13px] leading-5 text-white/70">
          {{ step.description }}
        </p>
      </article>

      <div
        v-if="index < safeSteps.length - 1"
        class="hidden items-center justify-center text-white/30 md:flex"
        aria-hidden="true"
      >
        <ArrowRight class="h-5 w-5" />
      </div>
    </template>
  </div>
</template>
