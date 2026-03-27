<script setup lang="ts">
import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    sectionClass?: string;
    containerClass?: string;
    contentClass?: string;
    introClass?: string;
    bodyClass?: string;
  }>(),
  {
    eyebrow: "",
    description: "",
    sectionClass: "bg-background",
    containerClass: "container-content",
    contentClass: "mx-auto w-full max-w-4xl",
    introClass: "max-w-3xl",
    bodyClass: "mt-8",
  }
);
</script>

<template>
  <section :class="sectionClass">
    <div :class="containerClass" class="py-10 md:py-14">
      <div :class="contentClass">
        <div :class="introClass">
          <ContentSectionIntro
            :eyebrow="eyebrow"
            :title="title"
            :description="description"
          />
        </div>

        <div :class="bodyClass">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>