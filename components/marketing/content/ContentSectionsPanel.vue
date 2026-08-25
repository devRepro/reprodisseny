<script setup lang="ts">
import type { DetailsMediaItem, SectionViewModel } from "~/types/contentSections";
import ContentDetailsTabPanel from "./ContentDetailsTabPanel.vue";
import ContentStructuredGrid from "./ContentStructuredGrid.vue";
import ContentTechnicalSpecsSection from "./ContentTechnicalSpecsSection.vue";

withDefaults(
  defineProps<{
    section: SectionViewModel;
    detailsMedia?: DetailsMediaItem | null;
    featuredProduct?: Record<string, unknown> | null;
  }>(),
  {
    detailsMedia: null,
    featuredProduct: null,
  }
);
</script>

<template>
  <ContentDetailsTabPanel
    v-if="section.pattern === 'editorial'"
    :section="section"
    :details-media="detailsMedia"
    :featured-product="featuredProduct"
    header-mode="none"
  />

  <ContentStructuredGrid
    v-else-if="section.pattern === 'structured-grid'"
    :section="section"
  />

  <ContentTechnicalSpecsSection
    v-else-if="section.pattern === 'technical-specs'"
    :section="section"
  />
</template>
