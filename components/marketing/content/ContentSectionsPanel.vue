<script setup lang="ts">
import { computed } from "vue";
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
import ContentApplicationsSection from "@/components/marketing/content/ContentApplicationsSection.vue";

import { useResolvedContentSection } from "~/composables/content/useResolvedContentSection";

type RichTypeSourceItem = {
  title?: unknown;
  description?: unknown;
  text?: unknown;
  features?: unknown;
  tags?: unknown;
  idealFor?: unknown;
  meta?: unknown;
};

type RichTypeItem = {
  title: string;
  description: string;
  features?: string[];
  idealFor?: string;
};

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

const isTypesSection = computed(() => {
  const sectionKey = String(key.value || "").trim();
  const sectionKind = String(kind.value || "").trim();
  const sectionId = String(props.section?.id || "").trim();

  return sectionKey === "types" || sectionKind === "types" || sectionId === "types";
});

const isApplicationsSection = computed(() => {
  const sectionKey = String(key.value || "").trim();
  const sectionKind = String(kind.value || "").trim();
  const sectionId = String(props.section?.id || "").trim();

  return (
    sectionKey === "applications" ||
    sectionKind === "applications" ||
    sectionId === "applications"
  );
});

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.map((item) => normalizeText(item)).filter(Boolean);
}

const typeItems = computed<RichTypeItem[]>(() => {
  const rawItems = Array.isArray(props.section?.items) ? props.section.items : [];

  return rawItems
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const source = item as RichTypeSourceItem;

      const title = normalizeText(source.title);
      const description = normalizeText(source.description || source.text);

      if (!title || !description) return null;

      const features = normalizeTags(
        Array.isArray(source.features) ? source.features : source.tags
      );

      const idealFor = normalizeText(source.idealFor || source.meta);

      return {
        title,
        description,
        ...(features.length ? { features } : {}),
        ...(idealFor ? { idealFor } : {}),
      };
    })
    .filter((item): item is RichTypeItem => Boolean(item));
});
</script>

<template>
  <div class="grid gap-8">
    <div class="min-w-0">
      <ContentDetailsTabPanel
        v-if="kind === 'details'"
        :section="props.section"
        :details-media="props.detailsMedia"
        :featured-product="props.featuredProduct"
        :header-mode="props.headerMode"
      />

      <ContentTypesGrid
        v-else-if="isTypesSection && typeItems.length"
        :section-id="props.section.id"
        :title="title"
        :intro="intro"
        :items="typeItems"
        :eyebrow="eyebrow || 'Soluciones disponibles'"
        :show-header="props.headerMode === 'default'"
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

      <ContentApplicationsSection
        v-else-if="isApplicationsSection"
        :section="props.section"
        :show-header="props.headerMode === 'default'"
      />

      <ContentTypesGrid
        v-else-if="shouldUseSimpleGrid && simpleGridItems.length"
        :section-id="props.section.id"
        :title="title"
        :intro="intro"
        :items="simpleGridItems"
        :eyebrow="eyebrow"
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
    </div>
  </div>
</template>