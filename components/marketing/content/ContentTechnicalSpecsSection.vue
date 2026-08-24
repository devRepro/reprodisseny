<script setup lang="ts">
import { computed, type Component } from "vue";
import {
  CircleGauge,
  ClipboardCheck,
  FileCheck2,
  Palette,
  Printer,
  Ruler,
  Scissors,
  Settings2,
} from "lucide-vue-next";

import type {
  ContentSectionHeaderMode,
  SectionInput,
  TechnicalHighlightIcon,
} from "~/types/contentSections";
import { normalizeTechnicalHighlights } from "~/utils/content/technicalHighlights";

import ContentDetailsSection from "@/components/marketing/content/ContentDetailsSection.vue";

const props = withDefaults(
  defineProps<{
    section: SectionInput;
    showHeader?: boolean;
    headerMode?: ContentSectionHeaderMode;
  }>(),
  {
    showHeader: true,
    headerMode: "default",
  }
);

const iconComponents: Record<TechnicalHighlightIcon, Component> = {
  "circle-gauge": CircleGauge,
  "clipboard-check": ClipboardCheck,
  "file-check-2": FileCheck2,
  palette: Palette,
  printer: Printer,
  ruler: Ruler,
  scissors: Scissors,
  "settings-2": Settings2,
};

const highlights = computed(() =>
  normalizeTechnicalHighlights(props.section.technicalHighlights)
);

const highlightsGridClass = computed(() => {
  if (highlights.value.length === 1) return "lg:grid-cols-1";
  if (highlights.value.length === 2) return "lg:grid-cols-2";
  if (highlights.value.length === 3) return "lg:grid-cols-3";
  return "lg:grid-cols-4";
});

const hasLongContent = computed(() =>
  [props.section.body, props.section.text, props.section.html, props.section.intro]
    .some((value) => typeof value === "string" && value.trim().length > 0)
);

function resolveIcon(icon?: TechnicalHighlightIcon): Component {
  return icon ? iconComponents[icon] : Settings2;
}
</script>

<template>
  <section class="space-y-6">
    <div
      v-if="highlights.length"
      :class="['grid gap-3 sm:grid-cols-2', highlightsGridClass]"
    >
      <article
        v-for="(item, index) in highlights"
        :key="`${item.title}-${index}`"
        class="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
      >
        <div
          class="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-primary/70 opacity-0 transition-opacity group-hover:opacity-100"
        />

        <div class="mb-4 flex items-start justify-between gap-3">
          <div
            class="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15"
          >
            <component :is="resolveIcon(item.icon)" class="size-4" aria-hidden="true" />
          </div>

          <span
            class="rounded-full bg-muted px-2 py-0.5 text-[0.68rem] font-semibold text-muted-foreground"
          >
            {{ String(index + 1).padStart(2, "0") }}
          </span>
        </div>

        <h3 class="text-sm font-semibold tracking-tight text-foreground">
          {{ item.title }}
        </h3>

        <p class="mt-1.5 text-[0.8125rem] leading-6 text-muted-foreground">
          {{ item.description }}
        </p>
      </article>
    </div>

    <div
      v-if="hasLongContent"
      class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm md:p-7"
    >
      <ContentDetailsSection
        :section="section"
        :show-header="showHeader"
        class="content-details--technical"
      />
    </div>
  </section>
</template>

<style scoped>
:deep(.content-details--technical) {
  @apply max-w-3xl;
}

:deep(.content-details--technical p) {
  @apply text-sm leading-7 text-muted-foreground md:text-base;
}

:deep(.content-details--technical h3) {
  @apply mb-3 mt-7 text-base font-semibold tracking-tight text-foreground md:text-lg;
}

:deep(.content-details--technical ul) {
  @apply my-4 space-y-3;
}

:deep(.content-details--technical li) {
  @apply text-sm leading-7 text-muted-foreground md:text-base;
}

:deep(.content-details--technical li::marker) {
  @apply text-primary;
}

:deep(.content-details--technical strong) {
  @apply font-semibold text-foreground;
}

:deep(.content-details--technical blockquote) {
  @apply mt-8 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-foreground;
}

:deep(.content-details--technical blockquote p) {
  @apply m-0 text-sm leading-7 text-foreground md:text-base;
}
</style>
