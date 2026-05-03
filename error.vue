<!-- error.vue -->
<script setup lang="ts">
import { computed } from "vue";
import type { NuxtError } from "#app";

import ContactInfoBand from "@/components/marketing/ContactInfoBand.vue";
import AppButton from "@/components/shared/button/AppButton.vue";
import AppChip from "@/components/shared/pills/AppChip.vue";

const props = defineProps<{
  error: NuxtError;
}>();

const statusCode = computed(() => props.error?.statusCode ?? 500);
const is404 = computed(() => statusCode.value === 404);

const eyebrow = computed(() => {
  return is404.value ? "Error 404" : `Error ${statusCode.value}`;
});

const title = computed(() => {
  return is404.value
    ? "No hemos encontrado esta página"
    : "No hemos podido cargar esta página";
});

const description = computed(() => {
  return is404.value
    ? "Es posible que el enlace haya cambiado, que la página se haya movido o que la dirección no sea correcta. Puedes volver al inicio o acceder directamente a una de nuestras familias de producto."
    : "Ha ocurrido un problema al cargar esta página. Puedes volver al inicio o contactar con nuestro equipo para que podamos ayudarte.";
});

const quickLinks = [
  {
    label: "Adhesivos",
    to: "/categorias/adhesivos",
  },
  {
    label: "Gran formato",
    to: "/categorias/gran-formato",
  },
  {
    label: "Expositores",
    to: "/categorias/expositores",
  },
  {
    label: "Libros y catálogos",
    to: "/categorias/libros-revistas-y-catalogos",
  },
  {
    label: "Packaging",
    to: "/categorias/packaging",
  },
  {
    label: "Publicidad y oficina",
    to: "/categorias/publicidad-y-oficina",
  },
];

const goTo = (path: string) => {
  clearError({ redirect: path });
};
</script>

<template>
  <NuxtLayout>
    <main class="bg-background text-foreground">
      <section class="relative overflow-hidden bg-background">
        <div class="container-content py-10 sm:py-12 md:py-16 lg:py-20">
          <div
            class="relative overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_24px_70px_-48px_hsl(var(--foreground)/0.34)]"
          >
            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,hsl(var(--primary)/0.12),transparent_34%),linear-gradient(135deg,hsl(var(--accent)/0.72),hsl(var(--background))_52%,hsl(var(--brand-bg-2)/0.48))]"
            />

            <div class="relative grid items-center gap-0 lg:grid-cols-[0.92fr_1.08fr]">
              <div class="px-5 py-8 sm:px-8 sm:py-10 md:px-10 lg:px-12 lg:py-14">
                <p class="section-eyebrow mb-4">
                  {{ eyebrow }}
                </p>

                <h1
                  class="section-title section-title--hero section-title--ink max-w-[620px] text-balance"
                >
                  {{ title }}
                </h1>

                <p class="section-subtitle mt-5 max-w-[640px]">
                  {{ description }}
                </p>

                <div class="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <AppButton
                    variant="primary"
                    size="md"
                    class="w-full sm:w-auto"
                    @click="goTo('/')"
                  >
                    Volver al inicio
                  </AppButton>

                  <AppButton
                    variant="outline"
                    size="md"
                    class="w-full bg-white/80 sm:w-auto"
                    @click="goTo('/contacto')"
                  >
                    Contactar con un experto
                  </AppButton>
                </div>

                <div class="mt-8 border-t border-border/60 pt-6">
                  <p class="mb-3 text-body-s font-semibold text-foreground/80">
                    Ir directamente a:
                  </p>

                  <div class="flex flex-wrap gap-2">
                    <AppChip
                      v-for="link in quickLinks"
                      :key="link.to"
                      variant="pill"
                      class="bg-white/80"
                      @click="goTo(link.to)"
                    >
                      {{ link.label }}
                    </AppChip>
                  </div>
                </div>
              </div>

              <div class="order-first p-4 sm:p-6 lg:order-none lg:p-8">
                <div
                  class="overflow-hidden rounded-[24px] bg-muted shadow-[0_20px_60px_-42px_hsl(var(--foreground)/0.55)] lg:rounded-[28px]"
                >
                  <img
                    src="/img/ui/error404.webp"
                    alt="Detalle de impresión sobre papel"
                    width="1024"
                    height="572"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    class="aspect-[16/10] w-full object-cover lg:aspect-[4/3]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactInfoBand
        section-class="bg-brand-base-dark text-brand-ink-light py-14 md:py-16 lg:py-20"
        container-class="container-wide"
      />
    </main>
  </NuxtLayout>
</template>
