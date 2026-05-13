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
    class="grid gap-5 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch"
  >
    <template v-for="(step, index) in safeSteps" :key="step.number">
      <article
        class="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.09] p-6 shadow-[0_22px_55px_-34px_rgba(0,0,0,.75)] transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] md:min-h-[190px] md:p-7"
      >
        <p
          class="text-right text-[clamp(3rem,5vw,4.75rem)] font-bold leading-none tracking-[-0.06em] text-white/20 transition duration-300 group-hover:text-white/28"
          aria-hidden="true"
        >
          {{ step.number }}
        </p>

        <div class="relative z-10 -mt-2">
          <h3 class="text-[17px] font-semibold leading-6 text-white md:text-[18px]">
            {{ step.title }}
          </h3>

          <p class="mt-3 max-w-[30rem] text-[14px] leading-6 text-white/74">
            {{ step.description }}
          </p>
        </div>
      </article>

      <div
        v-if="index < safeSteps.length - 1"
        class="hidden items-center justify-center text-white/35 md:flex"
        aria-hidden="true"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]"
        >
          <ArrowRight class="h-4 w-4" />
        </div>
      </div>
    </template>
  </div>
</template>