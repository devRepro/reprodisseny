<!-- components/marketing/ProcessSection.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";

type Step = {
  title: string;
  description: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    steps?: Step[];
    ctaText?: string;
    ctaLabel?: string;
    ctaHref?: string;
  }>(),
  {
    title: "Un proceso claro, un único interlocutor",
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
    ctaText: "¿Empezamos? Cuéntanos tu proyecto y te asesoramos sin compromiso.",
    ctaLabel: "Contacta con un experto",
    ctaHref: "/contacto",
  }
);

const safeSteps = computed<Step[]>(() => {
  if (!Array.isArray(props.steps)) return [];

  return props.steps.filter(
    (step): step is Step =>
      !!step && typeof step.title === "string" && typeof step.description === "string"
  );
});
</script>

<template>
  <section class="w-full bg-background">
    <div class="container-content">
      <div class="flex flex-col gap-8 py-8 md:gap-10 md:py-10">
        <SectionHeading
          as="h2"
          :title="props.title"
          title-tone="foreground"
          line-tone="foreground"
          class="w-full"
        />

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          <article
            v-for="(s, idx) in safeSteps"
            :key="`${idx}-${s.title}`"
            class="flex h-full items-start gap-4 rounded-2xl border border-primary/30 bg-card px-5 py-6"
          >
            <div
              class="shrink-0 text-3xl font-bold leading-none text-primary/40 md:text-4xl"
              aria-hidden="true"
            >
              {{ idx + 1 }}
            </div>

            <div class="flex min-w-0 flex-col gap-3">
              <h3 class="text-base font-semibold leading-6 text-primary md:text-lg">
                {{ s.title }}
              </h3>

              <p class="text-sm leading-6 text-foreground/80">
                {{ s.description }}
              </p>
            </div>
          </article>
        </div>

        <div class="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <p class="text-sm leading-6 text-foreground/80 md:text-base">
            {{ props.ctaText }}
          </p>

          <Button as-child>
            <NuxtLink :to="props.ctaHref">
              {{ props.ctaLabel }}
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
