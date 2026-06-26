<script setup lang="ts">
import { computed } from "vue"
import type { RouteLocationRaw } from "vue-router"
import AppButton from "@/components/shared/button/AppButton.vue"

type ProcessStep = {
  title: string
  description: string
}

type Props = {
  id?: string
  eyebrow?: string
  title?: string
  intro?: string
  steps?: ProcessStep[]
  ctaLabel?: string
  ctaTo?: RouteLocationRaw | null
  sectionClass?: string
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: "process-section",
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
  containerClass: "home-section__inner",
})

const headingId = computed(() => `${props.id}-title`)

const safeEyebrow = computed(() => String(props.eyebrow || "").trim())
const safeTitle = computed(() => String(props.title || "").trim())
const safeIntro = computed(() => String(props.intro || "").trim())
const safeCtaLabel = computed(() => String(props.ctaLabel || "").trim())

const safeSteps = computed<ProcessStep[]>(() => {
  if (!Array.isArray(props.steps)) return []

  return props.steps
    .map((step) => ({
      title: String(step?.title || "").trim(),
      description: String(step?.description || "").trim(),
    }))
    .filter((step) => step.title && step.description)
})

const hasHeader = computed(
  () => Boolean(safeEyebrow.value || safeTitle.value || safeIntro.value)
)

const hasCta = computed(() => Boolean(safeCtaLabel.value && props.ctaTo))
</script>

<template>
  <section
    :id="props.id"
    :class="[props.sectionClass, 'process-section']"
    :aria-labelledby="safeTitle ? headingId : undefined"
  >
    <div :class="[props.containerClass, 'process-section__container']">
      <div class="process-section__layout">
        <header
          v-if="hasHeader"
          class="process-section__header"
        >
          <p
            v-if="safeEyebrow"
            class="section-eyebrow"
          >
            {{ safeEyebrow }}
          </p>

          <h2
            v-if="safeTitle"
            :id="headingId"
            class="section-title section-title--section section-title--foreground process-section__title"
          >
            {{ safeTitle }}
          </h2>

          <p
            v-if="safeIntro"
            class="section-subtitle process-section__intro"
          >
            {{ safeIntro }}
          </p>

          <div
            class="section-divider process-section__divider"
            aria-hidden="true"
          />
        </header>

        <ol
          v-if="safeSteps.length"
          class="process-section__grid"
        >
          <li
            v-for="(step, index) in safeSteps"
            :key="`${index}-${step.title}`"
            class="process-section__item"
          >
            <article class="process-section__card">
              <div
                class="process-section__card-glow"
                aria-hidden="true"
              />

              <div
                class="process-section__number"
                aria-hidden="true"
              >
                {{ String(index + 1).padStart(2, "0") }}
              </div>

              <div class="process-section__card-content">
                <h3 class="process-section__step-title">
                  {{ step.title }}
                </h3>

                <p class="process-section__step-description">
                  {{ step.description }}
                </p>
              </div>
            </article>
          </li>
        </ol>

        <div
          v-if="hasCta"
          class="process-section__actions"
        >
          <AppButton
            :to="props.ctaTo"
            variant="primary"
            size="lg"
            arrow
          >
            {{ safeCtaLabel }}
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>