<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    sectionClass?: string;
    containerClass?: string;
    introClass?: string;
    bodyClass?: string;
    theme?: "default" | "muted";
    density?: "compact" | "default" | "relaxed";
    introSpacing?: "tight" | "default" | "loose";
  }>(),
  {
    eyebrow: "",
    description: "",
    sectionClass: "",
    containerClass: "container-content",
    introClass: "max-w-2xl",
    bodyClass: "w-full",
    theme: "default",
    density: "default",
    introSpacing: "default",
  }
);

const sectionPaddingClass = computed(() => {
  switch (props.density) {
    case "compact":
      return "py-8 md:py-10";
    case "relaxed":
      return "py-12 md:py-16";
    default:
      return "py-10 md:py-12";
  }
});

const contentSpacingClass = computed(() => {
  switch (props.introSpacing) {
    case "tight":
      return "space-y-5 md:space-y-6";
    case "loose":
      return "space-y-8 md:space-y-10";
    default:
      return "space-y-6 md:space-y-7";
  }
});

const themeClass = computed(() =>
  props.theme === "muted"
    ? "border-y border-border/50 bg-muted/30"
    : "bg-background"
);
</script>

<template>
  <section
    :class="
      cn(
        sectionPaddingClass,
        themeClass,
        props.sectionClass
      )
    "
  >
    <div :class="cn(props.containerClass)">
      <div :class="cn(contentSpacingClass)">
        <ContentSectionIntro
          :eyebrow="props.eyebrow"
          :title="props.title"
          :description="props.description"
          :class="props.introClass"
        />

        <div :class="cn('w-full', props.bodyClass)">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>