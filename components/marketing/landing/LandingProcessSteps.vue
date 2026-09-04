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
    variant?: "default" | "calendar";
  }>(),
  {
    steps: () => [],
    variant: "default",
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
    v-if="safeSteps.length && props.variant === 'default'"
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

  <div v-else-if="safeSteps.length" class="calendar-process-steps">
    <article v-for="step in safeSteps" :key="step.number" class="calendar-process-step">
      <p class="calendar-process-step__number" aria-hidden="true">{{ step.number }}</p>
      <h3 class="calendar-process-step__title">{{ step.title }}</h3>
    </article>
  </div>
</template>

<style scoped>
.calendar-process-steps {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.calendar-process-step {
  min-width: 0;
  border-radius: 8px;
  background: #eaf6fb;
  padding: 16px 18px;
  color: #004f78;
}

.calendar-process-step__number {
  color: #0076b3;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.calendar-process-step__title {
  margin-top: 10px;
  color: #004f78;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
}

@media (max-width: 1023px) {
  .calendar-process-steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 639px) {
  .calendar-process-steps {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .calendar-process-step {
    padding: 20px;
  }
}
</style>
