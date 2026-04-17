<script setup lang="ts">
import { CheckCircle2, RotateCcw, ArrowRight, Clock3 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

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
          class="inline-flex items-center rounded-full border border-primary/10 bg-background/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary"
        >
          Solicitud recibida
        </div>
      </div>

      <div class="mt-5 max-w-[42ch]">
        <h2
          class="text-[clamp(1.9rem,2.4vw,2.4rem)] font-semibold leading-[1.02] tracking-tight text-foreground text-balance"
        >
          {{ title }}
        </h2>

        <p class="mt-4 text-[15px] leading-7 text-foreground/78 md:text-base">
          Hemos recibido tu solicitud para
          <span class="font-semibold text-foreground">{{ productName }}</span>.
          Nuestro equipo la revisará y te responderá lo antes posible.
        </p>
      </div>

      <div
        class="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-border/50 bg-background/55 px-3 py-2 text-sm text-foreground/72"
      >
        <Clock3 class="h-4 w-4 shrink-0 text-primary" />
        <span>{{ etaText }}</span>
      </div>

      <div class="mt-auto pt-6">
        <div class="grid gap-3">
          <Button
            type="button"
            size="lg"
            class="h-11 w-full rounded-full text-sm font-semibold shadow-sm"
            @click="emit('reset')"
          >
            <RotateCcw class="mr-2 h-4 w-4" />
            Enviar otra solicitud
          </Button>

          <Button
            as-child
            type="button"
            variant="outline"
            size="lg"
            class="h-11 w-full rounded-full border-border/70 bg-background/72 text-sm font-semibold text-foreground shadow-sm hover:bg-background"
          >
            <NuxtLink :to="primaryTo">
              <span>Ver catálogo de productos</span>
              <ArrowRight class="ml-2 h-4 w-4" />
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>