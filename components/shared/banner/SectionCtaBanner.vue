<script setup lang="ts">
import { computed } from "vue";
import AppButton from "@/components/shared/button/AppButton.vue";

type LinkTarget = string | Record<string, unknown>;

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    primaryLabel: string;
    primaryTo: LinkTarget;
    secondaryLabel?: string;
    secondaryTo?: LinkTarget | null;
    sectionClass?: string;
    containerClass?: string;
    cardClass?: string;
    contentClass?: string;
  }>(),
  {
    eyebrow: "¿Tienes un proyecto en marcha?",
    description: "",
    secondaryLabel: "",
    secondaryTo: null,
    sectionClass: "catalog-section",
    containerClass: "container-wide",
    cardClass:
      "overflow-hidden rounded-[28px] bg-primary px-6 py-8 text-primary-foreground shadow-sm md:px-8 md:py-10",
    contentClass: "max-w-3xl",
  }
);

const hasSecondaryAction = computed(() =>
  Boolean(props.secondaryLabel?.trim() && props.secondaryTo)
);
</script>

<template>
  <section :class="props.sectionClass">
    <div :class="props.containerClass">
      <div :class="props.cardClass">
        <div :class="props.contentClass">
          <p v-if="props.eyebrow" class="section-eyebrow section-eyebrow--inverse mb-0">
            {{ props.eyebrow }}
          </p>

          <h2 class="mt-4 text-balance text-3xl font-bold leading-tight md:text-4xl">
            {{ props.title }}
          </h2>

          <p
            v-if="props.description"
            class="mt-4 mb-0 max-w-2xl text-body text-primary-foreground/84"
          >
            {{ props.description }}
          </p>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <AppButton :to="props.primaryTo" variant="secondary" size="md">
              {{ props.primaryLabel }}
            </AppButton>

            <AppButton
              v-if="hasSecondaryAction"
              :to="props.secondaryTo!"
              variant="ghost"
              size="md"
              class="text-primary-foreground hover:bg-white/10"
            >
              {{ props.secondaryLabel }}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
