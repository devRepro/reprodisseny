<script setup lang="ts">
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";
import AppButton from "@/components/shared/button/AppButton.vue";

const props = withDefaults(
  defineProps<{
    variant?: "desktop" | "mobile";
  }>(),
  {
    variant: "desktop",
  }
);

const emit = defineEmits<{
  landing: [];
  quote: [];
  dismiss: [];
}>();

const isMobile = computed(() => props.variant === "mobile");

const benefits = [
  {
    icon: "lucide:sun-medium",
    title: "Menos calor",
    text: "Reduce la entrada de calor solar en oficinas, locales y viviendas.",
    shortText: "Reduce la entrada de calor solar.",
  },
  {
    icon: "lucide:eye-off",
    title: "Menos reflejos",
    text: "Mejora el confort visual en pantallas, escaparates y zonas de trabajo.",
    shortText: "Mejora el confort visual en pantallas y escaparates.",
  },
  {
    icon: "lucide:building-2",
    title: "Sin cambiar cristales",
    text: "Solución rápida, limpia y adaptable al tipo de vidrio existente.",
    shortText: "Solución rápida, limpia y adaptable.",
  },
];
</script>

<template>
  <section
    class="relative flex min-h-0 flex-col overflow-hidden border border-border bg-background text-foreground shadow-[0_24px_70px_-42px_hsl(var(--foreground)/0.45)]"
    :class="
      isMobile
        ? 'max-h-[66dvh] rounded-t-[1.5rem] border-x-0 border-b-0'
        : 'max-h-[calc(100dvh-2.5rem)] rounded-[1.75rem]'
    "
    aria-labelledby="solar-film-promo-title"
  >
    <header class="shrink-0 border-b border-border/60 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex items-center gap-3">
          <div
            class="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/60 text-muted-foreground"
            aria-hidden="true"
          >
            <Icon name="lucide:sun-snow" class="size-5" />
          </div>

          <div class="min-w-0 space-y-1">
            <Badge
              variant="outline"
              class="h-6 rounded-full border-border bg-background px-2.5 text-[0.68rem] font-medium text-muted-foreground shadow-none"
            >
              Campaña láminas solares
            </Badge>

            <p class="truncate text-[0.78rem] font-medium leading-none text-muted-foreground">
              Protección solar para cristales
            </p>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="Cerrar promoción"
          @click="emit('dismiss')"
        >
          <Icon name="lucide:x" class="size-4" aria-hidden="true" />
        </button>
      </div>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
      <div class="space-y-4">
        <div class="space-y-2">
          <h2
            id="solar-film-promo-title"
            class="max-w-[22rem] text-[clamp(1.45rem,4.8vw,1.95rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground sm:max-w-none"
          >
            Reduce calor y reflejos sin cambiar los cristales
          </h2>

          <p class="max-w-[34rem] text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
            Instalamos láminas solares para oficinas, escaparates, locales y viviendas.
            <span class="hidden sm:inline">
              Te ayudamos a elegir el acabado adecuado según orientación, privacidad y exposición solar.
            </span>
          </p>
        </div>

        <ul class="grid gap-2.5">
          <li
            v-for="benefit in benefits"
            :key="benefit.title"
            class="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
          >
            <span
              class="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
              aria-hidden="true"
            >
              <Icon :name="benefit.icon" class="size-4" />
            </span>

            <span class="min-w-0">
              <span class="block text-sm font-semibold leading-5 text-foreground">
                {{ benefit.title }}
              </span>

              <span class="mt-0.5 block text-sm leading-5 text-muted-foreground">
                {{ isMobile ? benefit.shortText : benefit.text }}
              </span>
            </span>
          </li>
        </ul>
      </div>
    </div>

    <footer
      class="shrink-0 border-t border-border/60 bg-background/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-5 sm:pb-5"
    >
      <div class="grid gap-2 sm:grid-cols-2">
        <AppButton
          to="/lp/laminas-solares#quote-form"
          variant="primary"
          size="lg"
          block
          class="rounded-full !bg-foreground !text-background shadow-none hover:!bg-foreground/90 focus-visible:!ring-foreground/25"
          @click="emit('quote')"
        >
          Pedir presupuesto
        </AppButton>

        <AppButton
          to="/lp/laminas-solares"
          variant="outline"
          size="lg"
          arrow
          block
          class="rounded-full border-border bg-background text-foreground hover:bg-muted"
          @click="emit('landing')"
        >
          Ver láminas
        </AppButton>
      </div>

      <p class="mt-3 text-center text-[0.74rem] leading-5 text-muted-foreground/80">
        Sin compromiso. Te orientamos según el tipo de cristal y el uso del espacio.
      </p>
    </footer>
  </section>
</template>