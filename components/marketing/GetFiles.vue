<!-- components/marketing/quote/QuoteHero.vue -->
<script setup lang="ts">
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";

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
  <section class="relative isolate overflow-hidden bg-primary">
    <div class="container-content py-16 lg:py-20">
      <div class="grid items-center gap-10 lg:grid-cols-[485px_1fr] lg:gap-20">
        <div class="w-full lg:w-[485px]">
          <div class="overflow-hidden rounded-xl">
            <NuxtImg
              :src="props.imageSrc"
              :alt="props.imageAlt"
              width="485"
              height="309"
              format="webp"
              class="aspect-[485/309] w-full object-cover"
              loading="eager"
              fetchpriority="high"
            />
          </div>
        </div>

        <div class="text-white">
          <SectionHeading
            as="h2"
            :title="props.title"
            theme="inverse"
            :line="false"
            size="compact"
            class="w-full"
          />

          <p class="mt-6 mb-0 whitespace-pre-line text-body text-white/90">
            {{ props.body }}
          </p>

          <div class="mt-8">
            <NuxtLink
              :to="props.ctaTo"
              class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-primary transition hover:brightness-95"
            >
              {{ props.ctaLabel }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
