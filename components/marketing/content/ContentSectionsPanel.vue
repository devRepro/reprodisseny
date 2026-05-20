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

const TECHNICAL_SECTION_KEYS = new Set([
  "technical-specs",
  "technicalspecs",
  "technical",
  "specs",
  "caracteristicas",
  "caracteristicas-tecnicas",
  "especificaciones",
  "especificaciones-tecnicas",
]);

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

function normalizeSectionKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

const sectionKey = computed(() => normalizeSectionKey(key.value));
const sectionKind = computed(() => normalizeSectionKey(kind.value));
const sectionId = computed(() => normalizeSectionKey(props.section?.id));

function matchesSection(target: string) {
  return (
    sectionKey.value === target ||
    sectionKind.value === target ||
    sectionId.value === target
  );
}

const isTechnicalSpecsSection = computed(() => {
  return (
    TECHNICAL_SECTION_KEYS.has(sectionKey.value) ||
    TECHNICAL_SECTION_KEYS.has(sectionKind.value) ||
    TECHNICAL_SECTION_KEYS.has(sectionId.value)
  );
});

const isDetailsSection = computed(() => {
  if (isTechnicalSpecsSection.value) return false;

  return matchesSection("details");
});

const isTypesSection = computed(() => matchesSection("types"));

const isFormatsSection = computed(() => matchesSection("formats"));

const isFinishesSection = computed(() => matchesSection("finishes"));

const isApplicationsSection = computed(() => matchesSection("applications"));

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

      const itemTitle = normalizeText(source.title);
      const description = normalizeText(source.description || source.text);

      if (!itemTitle || !description) return null;

      const features = normalizeTags(
        Array.isArray(source.features) ? source.features : source.tags
      );

      const idealFor = normalizeText(source.idealFor || source.meta);

      return {
        title: itemTitle,
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
      <ContentDetailsSection
        v-if="isTechnicalSpecsSection"
        :section="props.section"
        :show-header="shouldShowDetailsHeader"
      />

      <ContentDetailsTabPanel
        v-else-if="isDetailsSection"
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
        v-else-if="isFormatsSection && formatsData"
        :section-id="props.section.id"
        :title="title"
        :data="formatsData"
        :show-header="props.headerMode === 'default'"
      />

      <ContentFinishesSection
        v-else-if="isFinishesSection && finishesItems.length"
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
