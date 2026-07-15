<script setup lang="ts">
import { ClipboardCheck, FileCheck2, Palette, Ruler } from "lucide-vue-next";

import type { ContentSectionHeaderMode, SectionInput } from "~/types/contentSections";

import ContentDetailsSection from "@/components/marketing/content/ContentDetailsSection.vue";

withDefaults(
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

const highlights = [
  {
    icon: Ruler,
    label: "01",
    title: "Formato",
    description: "Formato, medida y superficie imprimible.",
  },
  {
    icon: FileCheck2,
    label: "02",
    title: "Archivo",
    description: "PDF final, sangrado, márgenes y zona segura.",
  },
  {
    icon: Palette,
    label: "03",
    title: "Acabado",
    description: "Mate, brillo, impresión y corte especial.",
  },
  {
    icon: ClipboardCheck,
    label: "04",
    title: "Presupuesto",
    description: "Cantidad, fecha, diseño y adaptación gráfica.",
  },
];
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article
        v-for="item in highlights"
        :key="item.title"
        class="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
      >
        <div
          class="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-primary/70 opacity-0 transition-opacity group-hover:opacity-100"
        />

        <div class="mb-4 flex items-start justify-between gap-3">
          <div
            class="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15"
          >
            <component :is="item.icon" class="size-4" aria-hidden="true" />
          </div>

          <span
            class="rounded-full bg-muted px-2 py-0.5 text-[0.68rem] font-semibold text-muted-foreground"
          >
            {{ item.label }}
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

    <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm md:p-7">
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
