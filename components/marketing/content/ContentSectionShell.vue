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
  }>(),
  {
    eyebrow: "",
    description: "",
    sectionClass: "",
    containerClass: "container-content",
    introClass: "max-w-3xl",
    bodyClass: "w-full",
  }
);
</script>

<template>
  <section :class="cn('bg-background', props.sectionClass)">
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