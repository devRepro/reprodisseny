<script setup lang="ts">
import { computed, ref } from "vue";
import { useConfirmationFocus } from "@/composables/useConfirmationFocus";
import AppButton from "@/components/shared/button/AppButton.vue";
import {
  CheckCircle2,
  ArrowRight,
  Home,
  Clock3,
  Mail,
} from "lucide-vue-next";

type ThankYouKind = "contacto" | "presupuesto";

const props = withDefaults(
  defineProps<{
    kind?: ThankYouKind;
    title?: string;
    message?: string;
    primaryLabel?: string;
    primaryTo?: string;
    secondaryLabel?: string;
    secondaryTo?: string;
    autofocusTitle?: boolean;
  }>(),
  {
    kind: "contacto",
    title: "",
    message: "",
    primaryLabel: "Volver al inicio",
    primaryTo: "/",
    secondaryLabel: "Ver categorías",
    secondaryTo: "/categorias",
    autofocusTitle: true,
  }
);

const headingRef = ref<HTMLElement | null>(null);
if (props.autofocusTitle) useConfirmationFocus(headingRef);

const panelContent = computed(() => {
  if (props.kind === "presupuesto") {
    return {
      title: props.title || "¡Gracias por solicitar tu presupuesto!",
      message:
        props.message ||
        "Hemos recibido tu solicitud correctamente. Nuestro equipo revisará la información y te responderá lo antes posible, normalmente en menos de 24 horas laborables.",
      steps: [
        {
          icon: Mail,
          title: "Solicitud recibida",
          text: "Tu petición ya ha entrado en nuestro flujo de revisión.",
        },
        {
          icon: Clock3,
          title: "Revisión del equipo",
          text: "Analizaremos la información, materiales y necesidades del proyecto.",
        },
        {
          icon: ArrowRight,
          title: "Siguiente paso",
          text: "Te contactaremos con respuesta, dudas o propuesta económica.",
        },
      ],
    };
  }

  return {
    title: props.title || "¡Gracias por contactar con nosotros!",
    message:
      props.message ||
      "Hemos recibido tu mensaje correctamente y ya está en manos de nuestro equipo. Te responderemos lo antes posible, normalmente en menos de 24 horas laborables.",
    steps: [
      {
        icon: Mail,
        title: "Mensaje recibido",
        text: "Tu consulta ya está registrada y asignada a nuestro equipo.",
      },
      {
        icon: Clock3,
        title: "Revisión",
        text: "Revisaremos el contexto para darte una respuesta útil y clara.",
      },
      {
        icon: ArrowRight,
        title: "Respuesta",
        text: "Te contestaremos por email o teléfono según el caso.",
      },
    ],
  };
});

</script>

<template>
  <section
    class="confirmation-surface rounded-3xl border border-border bg-brand-bg-2 shadow-sm"
    role="status"
    aria-live="polite"
  >
    <div
      class="mx-auto flex min-w-0 max-w-4xl flex-col items-center gap-5 px-4 py-6 text-center md:gap-6 md:px-10 md:py-10"
    >
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background text-primary shadow-sm md:h-16 md:w-16"
      >
        <CheckCircle2 class="h-7 w-7" aria-hidden="true" />
      </div>

      <div class="min-w-0 max-w-full space-y-3">
        <h1
          ref="headingRef"
          tabindex="-1"
          class="confirmation-heading text-balance text-2xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          {{ panelContent.title }}
        </h1>

        <p
          class="mx-auto max-w-3xl text-pretty text-base leading-6 text-muted-foreground md:text-lg md:leading-7"
        >
          {{ panelContent.message }}
        </p>
      </div>

      <div class="confirmation-actions confirmation-actions--pair max-w-2xl">
        <AppButton :to="primaryTo" size="lg" class="confirmation-action">
          <Home class="h-4 w-4" aria-hidden="true" />
          <span>{{ primaryLabel }}</span>
        </AppButton>
        <AppButton :to="secondaryTo" variant="outline" size="lg" class="confirmation-action">
          <span>{{ secondaryLabel }}</span>
          <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </AppButton>
      </div>

      <div class="grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-3">
        <article
          v-for="(step, index) in panelContent.steps"
          :key="index"
          class="confirmation-step min-w-0 rounded-2xl border border-border/70 bg-background/80 p-3 text-left md:p-4"
        >
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <component :is="step.icon" class="h-4 w-4" aria-hidden="true" />
          </div>

          <h2 class="self-center text-sm font-semibold text-foreground md:text-base">
            {{ step.title }}
          </h2>

          <p class="text-sm leading-5 text-muted-foreground md:leading-6">
            {{ step.text }}
          </p>
        </article>
      </div>

    </div>
  </section>
</template>
