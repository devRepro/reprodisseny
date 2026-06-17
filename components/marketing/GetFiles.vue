<!-- components/marketing/quote/QuoteHero.vue -->
<script setup lang="ts">
import { computed, ref } from "vue";
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";
import AppButton from "@/components/shared/button/AppButton.vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    body?: string;
    ctaLabel?: string;
    ctaTo?: string;
    imageSrc?: string;
    imageAlt?: string;
  }>(),
  {
    title: "Pide tu presupuesto",
    body:
      "Explícanos qué necesitas producir y te diremos cómo podemos ayudarte.\nRespondemos rápido pero si lo necesitas urgente, mejor llámanos.",
    ctaLabel: "Pide tu presupuesto",
    ctaTo: "/pedir-presupuesto",
    imageSrc: "/img/ui/contact.png",
    imageAlt: "Persona trabajando en un portátil",
  },
);

const hasImageError = ref(false);

function normalizeImageSrc(src?: string) {
  const value = (src ?? "").trim();

  if (!value) return "";

  /**
   * URLs externas.
   */
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  /**
   * Data URI / blob.
   */
  if (/^(data:|blob:)/i.test(value)) {
    return value;
  }

  /**
   * Si por error llega "public/img/ui/contact.png",
   * en Nuxt debe servirse como "/img/ui/contact.png".
   */
  if (value.startsWith("public/")) {
    return `/${value.replace(/^public\/+/, "")}`;
  }

  /**
   * Ruta absoluta correcta.
   */
  if (value.startsWith("/")) {
    return value;
  }

  /**
   * Caso importante para Vercel:
   * "img/ui/contact.png" debe ser "/img/ui/contact.png".
   */
  return `/${value.replace(/^\.?\//, "")}`;
}

const normalizedImageSrc = computed(() => normalizeImageSrc(props.imageSrc));

function handleImageError() {
  hasImageError.value = true;
}
</script>

<template>
  <section
    class="relative isolate overflow-hidden bg-primary text-primary-foreground"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        class="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-foreground/14 blur-3xl"
      />

      <div
        class="absolute right-[-12rem] top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full bg-primary-foreground/10 blur-3xl"
      />

      <div
        class="absolute bottom-[-14rem] left-1/3 h-96 w-96 rounded-full bg-background/10 blur-3xl"
      />

      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary-foreground)/0.10),transparent_32%),linear-gradient(135deg,hsl(var(--primary)/0)_0%,hsl(var(--primary-foreground)/0.08)_100%)]"
      />
    </div>

    <div class="home-section__inner relative py-16 lg:py-20">
      <div class="grid items-center gap-10 lg:grid-cols-[485px_1fr] lg:gap-20">
        <div class="w-full lg:w-[485px]">
          <img
            v-if="normalizedImageSrc && !hasImageError"
            :src="normalizedImageSrc"
            :alt="props.imageAlt"
            width="485"
            height="309"
            class="aspect-[485/309] w-full rounded-[24px] object-cover shadow-[0_24px_70px_-42px_hsl(var(--foreground)/0.45)]"
            loading="eager"
            decoding="async"
            fetchpriority="high"
            @error="handleImageError"
          />

          <div
            v-else
            class="flex aspect-[485/309] w-full items-center justify-center rounded-[24px] border border-primary-foreground/16 bg-primary-foreground/10 p-8 text-center shadow-[0_24px_70px_-42px_hsl(var(--foreground)/0.45)]"
            aria-hidden="true"
          >
            <span
              class="max-w-xs text-sm font-medium leading-6 text-primary-foreground/75"
            >
              Te ayudamos a definir el producto, el acabado y la mejor forma de producirlo.
            </span>
          </div>
        </div>

        <div class="max-w-2xl text-primary-foreground">
          <SectionHeading
            as="h2"
            :title="props.title"
            theme="inverse"
            :line="false"
            size="compact"
            class="w-full"
          />

          <p
            class="mt-6 mb-0 whitespace-pre-line text-body leading-7 text-primary-foreground/88"
          >
            {{ props.body }}
          </p>

          <div class="mt-8">
            <AppButton
              :to="props.ctaTo"
              variant="secondary"
              size="lg"
              class="rounded-xl border-transparent bg-primary-foreground text-primary hover:bg-primary-foreground/92 focus-visible:ring-primary-foreground/50 focus-visible:ring-offset-primary"
            >
              {{ props.ctaLabel }}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>