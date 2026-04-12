<script setup lang="ts">
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
  }>(),
  {
    eyebrow: "",
    description: "",
    sectionClass: "",
    containerClass: "container-content",
    introClass: "max-w-3xl",
    bodyClass: "w-full",
    theme: "default", // Aquí es donde le decimos que el valor por defecto es 'default'
  }
);
</script>

<template>
  <section
    :class="
      cn(
        'py-12 md:py-16',
        props.theme === 'muted'
          ? 'bg-muted/30 border-y border-border/50'
          : 'bg-background',
        props.sectionClass
      )
    "
  >
    <div :class="cn(props.containerClass)">
      <div class="space-y-8 md:space-y-10">
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
