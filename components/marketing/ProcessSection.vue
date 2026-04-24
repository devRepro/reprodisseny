<!-- components/marketing/ProcessSection.vue -->
<script setup lang="ts">
import { computed } from "vue";
import AppButton from "@/components/shared/button/AppButton.vue";

type Step = {
  title: string;
  description: string;
};

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title?: string;
    intro?: string;
    steps?: Step[];
    ctaLabel?: string;
    ctaTo?: string | Record<string, unknown> | null;
    sectionClass?: string;
    containerClass?: string;
  }>(),
  {
    eyebrow: "Cómo trabajamos",
    title: "Un proceso claro, un único interlocutor",
    intro:
      "Te acompañamos desde la primera consulta hasta la entrega final, con asesoramiento técnico y control de producción en cada fase.",
    steps: () => [
      {
        title: "Nos explicas tu necesidad",
        description:
          "Analizamos tu proyecto, plazos y objetivos para proponerte la mejor solución desde el inicio.",
      },
      {
        title: "Te asesoramos y lo validamos contigo",
        description:
          "Te ayudamos a tomar decisiones técnicas y creativas antes de producir, evitando errores y sobrecostes.",
      },
      {
        title: "Producimos con control y calidad",
        description:
          "Producimos internamente o con partners de confianza, supervisando cada fase del proceso.",
      },
      {
        title: "Entregamos o instalamos",
        description:
          "Nos ocupamos de la logística, distribución e instalación para que el resultado final sea impecable.",
      },
    ],
    ctaLabel: "Contacta con nosotros",
    ctaTo: "/contacto#formulario",
    sectionClass: "catalog-section bg-background",
    containerClass: "container-content",
  }
);

const headingId = "process-section-title";

const safeSteps = computed<Step[]>(() => {
  if (!Array.isArray(props.steps)) return [];

  return props.steps
    .map((step) => ({
      title: String(step?.title || "").trim(),
      description: String(step?.description || "").trim(),
    }))
    .filter((step) => step.title && step.description);
});
</script>

<template>
  <section :class="props.sectionClass" :aria-labelledby="headingId">
    <div :class="props.containerClass">
      <div class="space-y-8 md:space-y-10">
        <div class="max-w-3xl">
          <p v-if="props.eyebrow" class="section-eyebrow">
            {{ props.eyebrow }}
          </p>

          <h2
            :id="headingId"
            class="section-title section-title--section section-title--foreground mt-4"
          >
            {{ props.title }}
          </h2>

          <p v-if="props.intro" class="section-subtitle mt-4">
            {{ props.intro }}
          </p>

          <div class="section-divider mt-5 max-w-xs" aria-hidden="true" />
        </div>

        <ol
          v-if="safeSteps.length"
          class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5"
        >
          <li
            v-for="(step, index) in safeSteps"
            :key="`${index}-${step.title}`"
            class="group relative list-none"
          >
            <article
              class="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-border/70 bg-card p-5 shadow-[0_14px_34px_-28px_hsl(var(--foreground)/0.28)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_42px_-30px_hsl(var(--foreground)/0.34)] md:p-6"
            >
              <div
                aria-hidden="true"
                class="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/7 blur-2xl transition group-hover:bg-primary/10"
              />

              <div class="relative flex items-start gap-4">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/6 text-sm font-bold text-primary"
                  aria-hidden="true"
                >
                  {{ String(index + 1).padStart(2, "0") }}
                </div>

                <div class="min-w-0 space-y-3">
                  <h3 class="text-base font-semibold leading-6 text-foreground">
                    {{ step.title }}
                  </h3>

                  <p class="text-sm leading-6 text-muted-foreground">
                    {{ step.description }}
                  </p>
                </div>
              </div>
            </article>
          </li>
        </ol>

        <div
          v-if="props.ctaLabel && props.ctaTo"
          class="flex justify-center pt-1 md:pt-2"
        >
          <AppButton
            :to="props.ctaTo"
            variant="primary"
            size="lg"
            arrow
            class="rounded-full px-7"
          >
            {{ props.ctaLabel }}
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>