<!-- components/marketing/quote/QuoteHero.vue -->
<script setup lang="ts">
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
    // ✅ a tu página: pages/pedir-presupuesto.vue
    ctaTo: "/pedir-presupuesto",
    // ✅ public/img/ui/contact.png => /img/ui/contact.png
    imageSrc: "/img/ui/contact.png",
    imageAlt: "Persona trabajando en un portátil",
  }
);
</script>

<template>
  <section class="relative isolate">
    <!-- ✅ fondo full-bleed con tu token -->
    <div
      class="absolute inset-0 left-1/2 w-screen -translate-x-1/2 bg-brand-dark -z-10"
    />

    <!-- ✅ layout del diseño: max 1200 + padding lateral -->
    <div class="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
      <div class="grid items-center gap-10 lg:grid-cols-[485px_1fr] lg:gap-20">
        <!-- Imagen (Figma: 485×309, radius 12) -->
        <div class="w-full lg:w-[485px]">
          <div class="overflow-hidden rounded-xl">
            <NuxtImg
              :src="props.imageSrc"
              :alt="props.imageAlt"
              width="485"
              height="309"
              format="webp"
              class="w-full aspect-[485/309] object-cover"
              loading="eager"
              fetchpriority="high"
            />
          </div>
        </div>

        <!-- Texto -->
        <div class="text-brand-ink-light">
          <!-- ✅ evita hacerlo gigante; muy parecido a Figma -->
          <h2 class="text-4xl font-bold leading-tight text-brand-ink-light">
            {{ props.title }}
          </h2>

          <p class="mt-6 mb-0 whitespace-pre-line text-body opacity-90">
            {{ props.body }}
          </p>

          <div class="mt-8">
            <NuxtLink
              :to="props.ctaTo"
              class="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold bg-brand-light text-brand-dark transition hover:brightness-95"
            >
              {{ props.ctaLabel }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
