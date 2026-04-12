<script setup lang="ts">
import { cn } from "@/lib/utils";
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    as?: "div" | "header";
    class?: string;
    eyebrowClass?: string;
    titleClass?: string;
    descriptionClass?: string;
    maxWidthClass?: string;
    spacingClass?: string;
    centered?: boolean;
    line?: boolean;
    surface?: boolean;
  }>(),
  {
    eyebrow: "",
    description: "",
    as: "div",
    class: "",
    eyebrowClass: "",
    titleClass: "",
    descriptionClass: "",
    maxWidthClass: "max-w-3xl",
    spacingClass: "",
    centered: false,
    line: true,
    surface: false,
  }
);
</script>

<template>
  <component
    :is="props.as"
    :class="
      cn(
        props.maxWidthClass,
        props.centered && 'mx-auto',
        props.surface && 'section-intro-surface',
        props.class
      )
    "
  >
    <SectionHeading
      as="h2"
      size="section"
      title-tone="foreground"
      :eyebrow="props.eyebrow"
      :title="props.title"
      :subtitle="props.description"
      :align="props.centered ? 'center' : 'left'"
      :line="props.line"
      :eyebrow-class="props.eyebrowClass"
      :title-class="props.titleClass"
      :subtitle-class="props.descriptionClass"
    />
  </component>
</template>
