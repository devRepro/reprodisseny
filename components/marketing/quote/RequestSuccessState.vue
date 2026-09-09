<script setup lang="ts">
import { CheckCircle2, RotateCcw, ArrowRight, Clock3 } from "lucide-vue-next";
import AppButton from "@/components/shared/button/AppButton.vue";

const props = withDefaults(
  defineProps<{
    productName?: string;
    primaryTo?: string;
    title?: string;
    etaText?: string;
  }>(),
  {
    productName: "",
    primaryTo: "/productos",
    title: "Solicitud enviada correctamente",
    etaText: "Respuesta habitual en menos de 24 horas laborables",
  }
);

const emit = defineEmits<{
  reset: [];
}>();
</script>

<template>
  <section
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="flex h-full min-h-0 w-full flex-1"
  >
    <div
      class="flex h-full w-full flex-1 flex-col rounded-[28px] border border-border/60 bg-[#FAF0DA] p-4 md:p-6"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-background/70 text-primary"
        >
          <CheckCircle2 class="h-5 w-5" />
        </div>

        <div
          class="inline-flex items-center rounded-full border border-primary/10 bg-background/55 px-3 py-1 text-label-s font-semibold uppercase tracking-[0.12em] text-primary"
        >
          Solicitud recibida
        </div>
      </div>

      <div class="mt-5 max-w-[42ch]">
        <h2
          class="text-h2 text-balance"
        >
          {{ title }}
        </h2>

        <p class="mt-4 text-body text-foreground/78">
          Hemos recibido tu solicitud para
          <span class="font-semibold text-foreground">{{ productName }}</span>.
          Nuestro equipo la revisará y te responderá lo antes posible.
        </p>
      </div>

      <div
        class="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-border/50 bg-background/55 px-3 py-2 text-body-s text-foreground/72"
      >
        <Clock3 class="h-4 w-4 shrink-0 text-primary" />
        <span>{{ etaText }}</span>
      </div>

      <div class="mt-auto pt-6">
        <div class="grid gap-3">
          <AppButton
            type="button"
            size="lg"
            block
            @click="emit('reset')"
          >
            <RotateCcw class="btn-icon-svg" />
            Enviar otra solicitud
          </AppButton>

          <AppButton
            :to="primaryTo"
            variant="outline"
            size="lg"
            block
          >
            <span>Ver catálogo de productos</span>
            <ArrowRight class="btn-icon-svg" />
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>