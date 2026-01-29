<template>
  <section class="relative isolate">
    <!-- Background image -->
    <div class="absolute inset-0 -z-10">
      <img
        v-if="imageSrc"
        :src="imageSrc"
        :alt="imageAlt"
        class="h-full w-full object-cover"
      />
      <div v-else class="h-full w-full bg-slate-200" />

      <!-- Overlay (tipo el diseño: legible con texto oscuro) -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-transparent"
      />
      <div
        class="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/10"
      />
    </div>

    <div class="mx-auto max-w-6xl px-4">
      <div class="flex min-h-[360px] items-center py-14 md:min-h-[440px] md:py-20">
        <div class="max-w-2xl">
          <p v-if="eyebrow" class="text-sm font-semibold tracking-wide text-slate-700">
            {{ eyebrow }}
          </p>

          <h1
            class="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
          >
            {{ title }}
          </h1>

          <p class="mt-4 text-base leading-7 text-slate-700 sm:text-lg">
            {{ subtitle }}
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <NuxtLink
              v-if="cta"
              :to="cta.to"
              class="inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
            >
              {{ cta.label }}
            </NuxtLink>

            <NuxtLink
              v-if="secondaryCta"
              :to="secondaryCta.to"
              class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white/60 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-white"
            >
              {{ secondaryCta.label }}
            </NuxtLink>
          </div>

          <div v-if="$slots.default" class="mt-8">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Cta = { label: string; to: string };

withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    imageSrc?: string;
    imageAlt?: string;
    eyebrow?: string;
    cta?: Cta;
    secondaryCta?: Cta;
  }>(),
  {
    imageAlt: "",
    eyebrow: "",
  }
);
</script>
