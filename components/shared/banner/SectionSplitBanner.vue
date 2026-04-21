<script setup lang="ts">
import { computed } from "vue";
import AppButton from "@/components/shared/button/AppButton.vue";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";

type LinkTarget = string | Record<string, unknown>;

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    imageSrc?: string;
    imageAlt?: string;
    pills?: string[];
    primaryLabel: string;
    primaryTo: LinkTarget;
    secondaryLabel?: string;
    secondaryTo?: LinkTarget | null;
    imagePosition?: "left" | "right";
    sectionClass?: string;
    containerClass?: string;
    cardClass?: string;
    contentClass?: string;
    mediaClass?: string;
  }>(),
  {
    eyebrow: "Proyecto a medida",
    description: "",
    imageSrc: "",
    imageAlt: "",
    pills: () => [],
    secondaryLabel: "",
    secondaryTo: null,
    imagePosition: "right",
    sectionClass: "",
    containerClass: "container-content",
    cardClass: "",
    contentClass: "",
    mediaClass: "",
  }
);

const hasSecondaryAction = computed(() =>
  Boolean(props.secondaryLabel?.trim() && props.secondaryTo)
);

const resolvedImageSrc = computed(() => {
  const value = String(props.imageSrc || "").trim();
  if (!value) return "";
  return normalizeCmsMediaSrc(value) || value;
});

const resolvedImageAlt = computed(() => {
  return String(props.imageAlt || "").trim() || props.title;
});

const displayPills = computed(() =>
  (props.pills || []).map((item) => String(item || "").trim()).filter(Boolean).slice(0, 6)
);

const mediaOrderClass = computed(() =>
  props.imagePosition === "left" ? "lg:order-1" : "lg:order-2"
);

const contentOrderClass = computed(() =>
  props.imagePosition === "left" ? "lg:order-2" : "lg:order-1"
);
</script>

<template>
  <section :class="sectionClass">
    <div :class="containerClass">
      <div
        :class="[
          'overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_16px_40px_-28px_hsl(var(--foreground)/0.16)]',
          cardClass,
        ]"
      >
        <div
          class="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-stretch"
        >
          <div
            :class="[
              'min-w-0 px-6 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10',
              contentOrderClass,
              contentClass,
            ]"
          >
            <div class="max-w-3xl space-y-5">
              <div class="space-y-3">
                <p
                  v-if="eyebrow"
                  class="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80"
                >
                  {{ eyebrow }}
                </p>

                <h2
                  class="text-balance text-[clamp(1.7rem,2.7vw,2.5rem)] font-bold leading-[1.08] text-foreground"
                >
                  {{ title }}
                </h2>

                <p
                  v-if="description"
                  class="max-w-[62ch] text-body leading-7 text-foreground/76"
                >
                  {{ description }}
                </p>
              </div>

              <div v-if="displayPills.length" class="flex flex-wrap gap-2">
                <span
                  v-for="pill in displayPills"
                  :key="pill"
                  class="inline-flex items-center rounded-full border border-primary/15 bg-primary/6 px-3 py-1.5 text-xs font-medium text-primary"
                >
                  {{ pill }}
                </span>
              </div>

              <div class="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
                <AppButton :to="primaryTo" variant="primary" size="md">
                  {{ primaryLabel }}
                </AppButton>

                <AppButton
                  v-if="hasSecondaryAction"
                  :to="secondaryTo!"
                  variant="outline"
                  size="md"
                >
                  {{ secondaryLabel }}
                </AppButton>
              </div>
            </div>
          </div>

          <div
            v-if="resolvedImageSrc"
            :class="[
              'relative min-h-[280px] overflow-hidden border-t border-border/60 bg-muted/20 lg:min-h-full lg:border-t-0',
              mediaOrderClass,
              imagePosition === 'left' ? 'lg:border-r lg:border-border/60' : 'lg:border-l lg:border-border/60',
              mediaClass,
            ]"
          >
            <img
              :src="resolvedImageSrc"
              :alt="resolvedImageAlt"
              class="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/12 via-transparent to-transparent"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
