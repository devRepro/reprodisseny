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
  SectionViewModel,
  TechnicalHighlightIcon,
} from "~/types/contentSections";
import ContentRichText from "./ContentRichText.vue";

const props = defineProps<{ section: SectionViewModel }>();

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

const highlights = computed(() => props.section.technicalHighlights || []);

function resolveIcon(icon?: TechnicalHighlightIcon): Component {
  return icon ? iconComponents[icon] : Settings2;
}
</script>

<template>
  <section :aria-label="section.title" class="space-y-5 md:space-y-6">
    <p v-if="section.intro" class="mb-0 max-w-3xl text-base leading-7 text-muted-foreground">
      {{ section.intro }}
    </p>

    <dl v-if="highlights.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(item, index) in highlights"
        :key="`${item.title}-${index}`"
        class="rounded-xl border border-border/70 bg-card p-4"
      >
        <dt class="flex items-center gap-2.5 text-sm font-semibold text-foreground">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary" aria-hidden="true">
            <component :is="resolveIcon(item.icon)" class="size-4" />
          </span>
          {{ item.title }}
        </dt>
        <dd class="mb-0 mt-2 text-sm leading-6 text-muted-foreground">
          {{ item.description }}
        </dd>
      </div>
    </dl>

    <div v-if="section.html" class="overflow-hidden rounded-2xl border border-border/70 bg-card p-5 md:p-7">
      <ContentRichText :html="section.html" compact />
    </div>
  </section>
</template>
