<script setup lang="ts">
import ContentSectionShell from "@/components/marketing/content/ContentSectionShell.vue";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";

type ContentFormatItem = {
  title: string;
  description: string;
};

type ContentFormatsData = {
  intro?: string;
  shapes: ContentFormatItem[];
  deliveryFormats: ContentFormatItem[];
};

withDefaults(
  defineProps<{
    title: string;
    data: ContentFormatsData;
    sectionId?: string;
  }>(),
  {
    sectionId: "",
  }
);
</script>

<template>
  <ContentSectionShell
    :id="sectionId"
    eyebrow="Información de la categoría"
    :title="title"
    :description="data.intro || ''"
    theme="default"
    section-class="scroll-mt-32"
    container-class="container-content"
    intro-class="max-w-4xl"
    body-class="space-y-10 md:space-y-12"
  >
    
  </ContentSectionShell>
</template>
