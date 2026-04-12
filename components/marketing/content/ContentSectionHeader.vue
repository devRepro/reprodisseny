<script setup lang="ts">
import { cn } from "@/lib/utils";
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    as?: "h2" | "h3" | "h4";
    class?: string;
    headingClass?: string;
    titleClass?: string;
    subtitleClass?: string;
    tone?: "brand" | "ink" | "foreground" | "white";
    divider?: boolean;
    eyebrow?: string;
  }>(),
  {
    subtitle: "",
    as: "h3",
    class: "",
    headingClass: "",
    titleClass: "",
    subtitleClass: "",
    tone: "foreground",
    divider: true,
    eyebrow: "",
  }
);
</script>

<template>
  <div :class="cn('w-full', props.class)">
    <SectionHeading
      :as="props.as"
      size="subsection"
      :eyebrow="props.eyebrow"
      :title="props.title"
      :subtitle="props.subtitle"
      :title-tone="props.tone"
      :line="props.divider"
      :class="props.headingClass"
      :title-class="props.titleClass"
      :subtitle-class="props.subtitleClass"
    />
  </div>
</template>
