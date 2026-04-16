<script setup lang="ts">
import AppButton from "@/components/shared/button/AppButton.vue";
import AppChip from "@/components/shared/pills/AppChip.vue";

withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    pills?: string[];
    primaryLabel: string;
    primaryTo: string | Record<string, unknown>;
    secondaryLabel?: string;
    secondaryTo?: string | Record<string, unknown> | null;
  }>(),
  {
    eyebrow: "Categorías",
    description: "",
    pills: () => [],
    secondaryLabel: "",
    secondaryTo: null,
  }
);
</script>

<template>
  <section class="catalog-section">
    <div class="container-content">
      <div class="catalog-panel-soft rounded-[28px]">
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

        <div v-if="pills.length" class="mt-6 flex flex-wrap gap-2">
          <AppChip v-for="pill in pills" :key="pill">
            {{ pill }}
          </AppChip>
        </div>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <AppButton :to="primaryTo" variant="primary" size="md">
            {{ primaryLabel }}
          </AppButton>

          <AppButton
            v-if="secondaryLabel && secondaryTo"
            :to="secondaryTo"
            variant="outline"
            size="md"
          >
            {{ secondaryLabel }}
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>