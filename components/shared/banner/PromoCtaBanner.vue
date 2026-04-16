<script setup lang="ts">
import AppButton from "@/components/shared/AppButton.vue";

withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    primaryLabel: string;
    primaryTo: string | Record<string, unknown>;
    secondaryLabel?: string;
    secondaryTo?: string | Record<string, unknown> | null;
  }>(),
  {
    eyebrow: "¿Tienes un proyecto en marcha?",
    description: "",
    secondaryLabel: "",
    secondaryTo: null,
  }
);
</script>

<template>
  <section class="catalog-section">
    <div class="container-wide">
      <div
        class="overflow-hidden rounded-[28px] bg-primary px-6 py-8 text-primary-foreground shadow-sm md:px-8 md:py-10"
      >
        <div class="max-w-3xl">
          <p v-if="eyebrow" class="section-eyebrow section-eyebrow--inverse mb-0">
            {{ eyebrow }}
          </p>

          <h2 class="mt-4 text-balance text-3xl font-bold leading-tight md:text-4xl">
            {{ title }}
          </h2>

          <p
            v-if="description"
            class="mt-4 mb-0 max-w-2xl text-body text-primary-foreground/84"
          >
            {{ description }}
          </p>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <AppButton :to="primaryTo" variant="secondary" size="md">
              {{ primaryLabel }}
            </AppButton>

            <AppButton
              v-if="secondaryLabel && secondaryTo"
              :to="secondaryTo"
              variant="ghost"
              size="md"
              class="text-primary-foreground hover:bg-white/10"
            >
              {{ secondaryLabel }}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>