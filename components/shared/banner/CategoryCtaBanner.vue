<script setup lang="ts">
import AppChip from "@/components/shared/pills/AppChip.vue";

withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    pills?: string[];
    primaryLabel: string;
    primaryTo: string | Record<string, unknown>;
  }>(),
  {
    eyebrow: "Asesoramiento",
    description: "",
    pills: () => [],
  }
);
</script>

<template>
  <section class="catalog-section">
    <div class="container-content">
      <div class="catalog-panel-soft rounded-[28px] px-6 py-6 sm:px-8 sm:py-8">
        <div class="max-w-3xl">
          <p v-if="eyebrow" class="section-eyebrow mb-0">
            {{ eyebrow }}
          </p>

          <h2 class="section-title section-title--section mt-4">
            {{ title }}
          </h2>

          <p
            v-if="description"
            class="mt-4 mb-0 max-w-2xl text-body text-muted-foreground"
          >
            {{ description }}
          </p>
        </div>

        <div v-if="pills.length" class="mt-5 flex flex-wrap gap-2">
          <AppChip v-for="pill in pills" :key="pill">
            {{ pill }}
          </AppChip>
        </div>

        <div class="mt-6">
          <NuxtLink
            :to="primaryTo"
            class="inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-5 py-2.5 text-body-s-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {{ primaryLabel }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
