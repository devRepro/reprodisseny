<template>
  <section class="relative overflow-hidden bg-sky-50 py-14">
    <div class="absolute inset-0">
      <NuxtImg
        v-if="bgImageSrc"
        :src="bgImageSrc"
        alt=""
        class="h-full w-full object-cover opacity-35"
        sizes="100vw"
      />
    </div>

    <div class="relative mx-auto max-w-7xl px-6">
      <div
        class="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between"
      >
        <h3 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {{ title }}
        </h3>

        <NuxtLink
          :to="cta.to"
          class="inline-flex items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {{ cta.label }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Cta = { label: string; to: string };

withDefaults(
  defineProps<{
    title?: string;
    bgImageSrc?: string;
    cta?: Cta;
  }>(),
  {
    title: "Cómo preparar tus archivos",
    bgImageSrc: "",
    cta: () => ({ label: "Ver la guía rápida", to: "/guia-archivos" }),
  }
);
</script>
