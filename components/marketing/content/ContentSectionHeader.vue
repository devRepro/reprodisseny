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
    dividerClass?: string;
  }>(),
  {
    subtitle: "",
    as: "h2",
    class: "",
    headingClass: "",
    titleClass: "",
    subtitleClass: "",
    tone: "foreground",
    divider: true,
    dividerClass: "",
  }
);
</script>

<template>
  <div :class="cn('w-full space-y-4', props.class)">
    <SectionHeading
      :as="props.as"
      :title="props.title"
      :subtitle="props.subtitle"
      size="compact"
      :title-tone="props.tone"
      :line="false"
      :class="cn('w-full', props.headingClass)"
      :title-class="cn('mb-0', props.titleClass)"
      :subtitle-class="cn('mt-3', props.subtitleClass)"
    />

    <div
      v-if="divider"
      aria-hidden="true"
      :class="
        cn(
          'h-px w-full bg-[linear-gradient(90deg,hsl(var(--border)/0),hsl(var(--border)/0.9)_12%,hsl(var(--border)/0.9)_88%,hsl(var(--border)/0))]',
          props.dividerClass
        )
      "
    />
  </div>
</template>