<script setup lang="ts">
import { computed, type Component } from "vue";
import { cn } from "@/lib/utils";
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

const props = withDefaults(
  defineProps<{
    section: SectionViewModel;
    presentation?: "default" | "product";
    showIntro?: boolean;
  }>(),
  {
    presentation: "default",
    showIntro: true,
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

const highlights = computed(() => props.section.technicalHighlights || []);
const isProductPresentation = computed(() => props.presentation === "product");

function resolveIcon(icon?: TechnicalHighlightIcon): Component {
  return icon ? iconComponents[icon] : Settings2;
}
</script>

<template>
  <section
    :aria-label="section.title"
    :class="cn(isProductPresentation ? 'space-y-6 md:space-y-8 content-technical-specs--product' : 'space-y-5 md:space-y-6')"
  >
    <p v-if="showIntro && section.intro" class="mb-0 max-w-3xl text-body text-muted-foreground">
      {{ section.intro }}
    </p>

    <dl
      v-if="highlights.length"
      :class="
        cn(
          isProductPresentation
            ? 'content-technical-specs__highlights'
            : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4'
        )
      "
    >
      <div
        v-for="(item, index) in highlights"
        :key="`${item.title}-${index}`"
        :class="
          cn(
            isProductPresentation
              ? 'content-technical-specs__highlight'
              : 'rounded-xl border border-border/70 bg-card p-4'
          )
        "
      >
        <dt class="flex items-center gap-2.5 text-body-s-bold text-foreground">
          <span
            :class="
              cn(
                'flex shrink-0 items-center justify-center text-primary',
                isProductPresentation ? 'size-5' : 'size-8 rounded-lg bg-primary/8'
              )
            "
            aria-hidden="true"
          >
            <component :is="resolveIcon(item.icon)" class="size-4" />
          </span>
          {{ item.title }}
        </dt>
        <dd class="mb-0 mt-2 text-body-s leading-6 text-muted-foreground">
          {{ item.description }}
        </dd>
      </div>
    </dl>

    <div
      v-if="section.html"
      :class="
        cn(
          isProductPresentation
            ? 'min-w-0'
            : 'overflow-hidden rounded-2xl border border-border/70 bg-card p-5 md:p-7'
        )
      "
    >
      <ContentRichText :html="section.html" :compact="!isProductPresentation" />
    </div>
  </section>
</template>
