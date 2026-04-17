<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
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

onMounted(async () => {
  if (!props.autofocusTitle) return;
  await nextTick();
  headingRef.value?.focus();
});
</script>

<template>
  <section
    class="rounded-3xl border border-border bg-brand-bg-2 shadow-sm"
    role="status"
    aria-live="polite"
  >
    <div
      class="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-10 text-center md:px-10 md:py-14"
    >
      <div
        class="flex h-16 w-16 items-center justify-center rounded-full bg-background text-primary shadow-sm"
      >
        <CheckCircle2 class="h-8 w-8" />
      </div>

      <div class="space-y-4">
        <h1
          ref="headingRef"
          tabindex="-1"
          class="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          {{ panelContent.title }}
        </h1>

        <p
          class="mx-auto max-w-3xl text-pretty text-base leading-7 text-muted-foreground md:text-lg"
        >
          {{ panelContent.message }}
        </p>
      </div>

      <div class="grid w-full gap-3 md:grid-cols-3">
        <article
          v-for="(step, index) in panelContent.steps"
          :key="index"
          class="rounded-2xl border border-border/70 bg-background/80 p-4 text-left"
        >
          <div
            class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <component :is="step.icon" class="h-5 w-5" />
          </div>

          <h2 class="text-sm font-semibold text-foreground md:text-base">
            {{ step.title }}
          </h2>

          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            {{ step.text }}
          </p>
        </article>
      </div>

      <div class="flex flex-col gap-3 pt-2 sm:flex-row">
        <AppButton :to="primaryTo" size="lg">
          <Home class="mr-2 h-4 w-4" />
          {{ primaryLabel }}
        </AppButton>

        <AppButton :to="secondaryTo" variant="outline" size="lg">
          {{ secondaryLabel }}
          <ArrowRight class="ml-2 h-4 w-4" />
        </AppButton>
      </div>
    </div>
  </section>
</template>