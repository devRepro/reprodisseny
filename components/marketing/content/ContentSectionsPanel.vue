<script setup lang="ts">
import type {
  ContentSectionHeaderMode,
  DetailsMediaItem,
  SectionInput,
} from "~/types/contentSections";

import ContentTypesGrid from "@/components/marketing/content/ContentTypesGrid.vue";
import ContentDetailsSection from "@/components/marketing/content/ContentDetailsSection.vue";
import ContentDetailsTabPanel from "@/components/marketing/content/ContentDetailsTabPanel.vue";
import ContentCardsSection from "@/components/marketing/content/ContentCardsSection.vue";
import ContentFinishesSection from "@/components/marketing/content/ContentFinishesSection.vue";
import ContentFormatsSection from "@/components/marketing/content/ContentFormatsSection.vue";
import type { CategoryCardGroup } from "@/components/marketing/content/ContentCardsSection.types";

import { useResolvedContentSection } from "~/composables/content/useResolvedContentSection";

const props = withDefaults(
  defineProps<{
    section: SectionInput;
    detailsMedia?: DetailsMediaItem | null;
    featuredProduct?: Record<string, unknown> | null;
    headerMode?: ContentSectionHeaderMode;
  }>(),
  {
    detailsMedia: null,
    featuredProduct: null,
    headerMode: "default",
  }
);

const {
  key,
  kind,
  title,
  intro,
  cardGroups,
  formatsData,
  finishesItems,
  simpleGridItems,
  shouldUseSimpleGrid,
  eyebrow,
  variant,
  shouldShowDetailsHeader,
} = useResolvedContentSection({
  section: () => props.section,
  headerMode: () => props.headerMode,
});


</script>

<template>
  <ContentDetailsTabPanel
    v-if="kind === 'details'"
    :section="props.section"
    :details-media="props.detailsMedia"
    :featured-product="props.featuredProduct"
    :header-mode="props.headerMode"
  />

  <ContentFormatsSection
    v-else-if="key === 'formats' && formatsData"
    :section-id="props.section.id"
    :title="title"
    :data="formatsData"
    :show-header="props.headerMode === 'default'"
  />

  <ContentFinishesSection
    v-else-if="key === 'finishes' && finishesItems.length"
    :section-id="props.section.id"
    :title="title"
    :intro="intro"
    :items="finishesItems"
    :show-header="props.headerMode === 'default'"
  />

  <ContentTypesGrid
    v-else-if="shouldUseSimpleGrid && simpleGridItems.length"
    :section-id="props.section.id"
    :title="title"
    :intro="intro"
    :items="simpleGridItems"
    :show-header="props.headerMode === 'default'"
  />

  <ContentCardsSection
    v-else-if="kind === 'cards' && cardGroups.length"
    :section-id="props.section.id"
    :title="title"
    :intro="intro"
    :eyebrow="eyebrow"
    :groups="cardGroups"
    :variant="variant"
    :show-header="props.headerMode === 'default'"
  />

  <ContentDetailsSection
    v-else
    :section="props.section"
    :show-header="shouldShowDetailsHeader"
  />
</template>