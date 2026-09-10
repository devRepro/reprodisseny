<script setup lang="ts">
import { computed } from "vue";
import type {
  ContentSectionKey,
  DetailsMediaItem,
  SectionViewModel,
} from "~/types/contentSections";
import ContentDetailsTabPanel from "./ContentDetailsTabPanel.vue";
import ContentStructuredGrid from "./ContentStructuredGrid.vue";
import ContentStructuredList from "./ContentStructuredList.vue";
import ContentTechnicalSpecsSection from "./ContentTechnicalSpecsSection.vue";

const props = withDefaults(
  defineProps<{
    section: SectionViewModel;
    detailsMedia?: DetailsMediaItem | null;
    featuredProduct?: Record<string, unknown> | null;
    presentation?: "default" | "product";
    showIntro?: boolean;
  }>(),
  {
    detailsMedia: null,
    featuredProduct: null,
    presentation: "default",
    showIntro: true,
  }
);

const productListSections: ContentSectionKey[] = [
  "formats",
  "materials",
  "finishes",
  "applications",
];

const usesProductStructuredList = computed(
  () =>
    props.presentation === "product" &&
    productListSections.includes(props.section.key)
);
</script>

<template>
  <ContentDetailsTabPanel
    v-if="section.pattern === 'editorial'"
    :section="section"
    :details-media="detailsMedia"
    :featured-product="featuredProduct"
    :presentation="presentation"
    :show-intro="showIntro"
    header-mode="none"
  />

  <ContentStructuredList
    v-else-if="section.pattern === 'structured-grid' && usesProductStructuredList"
    :section="section"
    :show-intro="showIntro"
  />

  <ContentStructuredGrid
    v-else-if="section.pattern === 'structured-grid'"
    :section="section"
  />

  <ContentTechnicalSpecsSection
    v-else-if="section.pattern === 'technical-specs'"
    :section="section"
    :presentation="presentation"
    :show-intro="showIntro"
  />
</template>
