<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    primaryLabel?: string;
    primaryTo?: string;
    secondaryLabel?: string;
    secondaryTo?: string;
  }>(),
  {
    title: "¿No tienes claro qué producto necesitas?",
    description:
      "Te ayudamos a elegir el soporte, material o formato más adecuado según el uso, el entorno y el objetivo de tu proyecto.",
    primaryLabel: "Pedir asesoramiento",
    primaryTo: "/contacto",
    secondaryLabel: "Ver cómo preparar archivos",
    secondaryTo: "/como-preparar-archivos",
  }
);
</script>

<template>
  <section class="container-content pb-16 md:pb-24" aria-label="Asesoramiento para elegir producto">
    <div
      class="overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-[0_14px_40px_-28px_hsl(var(--foreground)/0.16)]"
    >
      <div class="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="px-6 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75">
            Asesoramiento personalizado
          </p>

          <h2 class="mt-3 max-w-[18ch] text-[30px] font-semibold leading-[1.08] text-foreground md:text-[38px]">
            {{ title }}
          </h2>

          <p class="mt-5 max-w-[62ch] text-body leading-[1.7] text-foreground/72">
            {{ description }}
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <NuxtLink
              :to="primaryTo"
              class="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-body-s-bold text-primary-foreground transition hover:opacity-90"
            >
              {{ primaryLabel }}
            </NuxtLink>

            <NuxtLink
              :to="secondaryTo"
              class="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-body-s-bold text-foreground transition hover:border-primary/25 hover:text-primary"
            >
              {{ secondaryLabel }}
            </NuxtLink>
          </div>
        </div>

        <div class="relative min-h-[220px] border-t border-border/60 bg-muted/20 lg:min-h-full lg:border-l lg:border-t-0">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_42%),radial-gradient(circle_at_bottom_right,hsl(var(--foreground)/0.06),transparent_38%)]" />

          <div class="relative flex h-full flex-col justify-center gap-4 px-6 py-8 md:px-8 lg:px-10">
            <div class="rounded-2xl border border-border/60 bg-background/80 p-4 backdrop-blur-sm">
              <p class="text-sm font-semibold text-foreground">Te ayudamos a decidir</p>
              <p class="mt-2 text-sm leading-[1.6] text-foreground/68">
                Material recomendado, formato adecuado, durabilidad y acabado según tu caso.
              </p>
            </div>

            <div class="rounded-2xl border border-border/60 bg-background/80 p-4 backdrop-blur-sm">
              <p class="text-sm font-semibold text-foreground">Pensado para proyectos reales</p>
              <p class="mt-2 text-sm leading-[1.6] text-foreground/68">
                Retail, eventos, oficinas, campañas promocionales, packaging y señalización.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>