<!-- components/marketing/contact/ContactHero.vue -->
<script setup lang="ts">
type Props = {
  title?: string;
  description?: string;
};

const props = withDefaults(defineProps<Props>(), {
  title: "Pide tu presupuesto",
  description:
    "Explícanos qué necesitas producir y te diremos cómo podemos ayudarte.\nRespondemos rápido, pero si lo necesitas urgente, mejor llámanos.",
});
</script>

<template>
  <section class="bg-brand-base-light">
    <div class="container-content py-10 md:py-14 lg:py-16">
      <div class="mx-auto max-w-3xl text-center">
        <h1 class="text-3xl font-semibold leading-tight text-brand-base-dark md:text-4xl">
          {{ props.title }}
        </h1>

        <p
          class="mt-4 whitespace-pre-line text-base leading-7 text-brand-base-dark/80 md:text-lg md:leading-8"
        >
          {{ props.description }}
        </p>
      </div>
    </div>
  </section>
</template>
