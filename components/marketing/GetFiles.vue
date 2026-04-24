<!-- components/marketing/quote/QuoteHero.vue -->
<script setup lang="ts">
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
  }
);
</script>

<template>
  <section class="relative isolate overflow-hidden bg-primary text-primary-foreground">
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

    <div class="container-content relative py-16 lg:py-20">
      <div class="grid items-center gap-10 lg:grid-cols-[485px_1fr] lg:gap-20">
        <div class="w-full lg:w-[485px]">
          <NuxtImg
            :src="props.imageSrc"
            :alt="props.imageAlt"
            width="485"
            height="309"
            format="webp"
            class="aspect-[485/309] w-full rounded-[24px] object-cover"
            loading="eager"
            fetchpriority="high"
          />
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