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

type GalleryImage = {
  src?: string;
  alt?: string;
  caption?: string;
  width?: number | null;
  height?: number | null;
};

const props = withDefaults(
  defineProps<{
    section: SectionInput;
    detailsMedia?: DetailsMediaItem | null;
    featuredProduct?: Record<string, unknown> | null;
    headerMode?: ContentSectionHeaderMode;
    galleryImages?: GalleryImage[];
  }>(),
  {
    detailsMedia: null,
    featuredProduct: null,
    headerMode: "default",
    galleryImages: () => [],
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

function normalizeForMatch(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const sectionKeyForImage = computed(() => {
  const sectionId = String(props.section?.id || "").trim();

  return String(key.value || kind.value || sectionId || "")
    .trim()
    .toLowerCase();
});

function getImageScoreForSection(image: GalleryImage, sectionKey: string) {
  const haystack = normalizeForMatch(
    `${image.src || ""} ${image.alt || ""} ${image.caption || ""}`
  );

  if (["details", "applications"].includes(sectionKey)) {
    if (haystack.includes("detalles")) return 10;
    if (haystack.includes("aplicacion")) return 8;
    if (haystack.includes("packaging")) return 6;
  }

  if (["types", "materials", "formats"].includes(sectionKey)) {
    if (haystack.includes("tipos")) return 10;
    if (haystack.includes("material")) return 8;
    if (haystack.includes("papel")) return 6;
    if (haystack.includes("vinilo")) return 6;
  }

  if (sectionKey === "finishes") {
    if (haystack.includes("acabados")) return 10;
    if (haystack.includes("acabado")) return 8;
    if (haystack.includes("laminado")) return 6;
  }

  return 0;
}

const contextualImage = computed(() => {
  const images = (props.galleryImages ?? []).filter((image) =>
    String(image?.src || "").trim()
  );

  if (!images.length) return null;

  const currentSectionKey = sectionKeyForImage.value;

  /**
   * Si la sección details ya recibe detailsMedia con imagen propia,
   * evitamos duplicar imagen.
   */
  if (
    currentSectionKey === "details" &&
    String(props.detailsMedia?.image?.src || "").trim()
  ) {
    return null;
  }

  const ranked = images
    .map((image) => ({
      image,
      score: getImageScoreForSection(image, currentSectionKey),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.image ?? null;
});

const hasContextualImage = computed(() => Boolean(contextualImage.value?.src));

const panelLayoutClass = computed(() =>
  hasContextualImage.value
    ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start"
    : "grid gap-8"
);
</script>

<template>
  <div :class="panelLayoutClass">
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

    <aside
      v-if="contextualImage?.src"
      class="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"
    >
      <NuxtImg
        :src="contextualImage.src"
        :alt="contextualImage.alt || title || 'Imagen del producto'"
        class="aspect-[4/3] w-full object-cover"
        sizes="sm:100vw md:50vw lg:360px"
        loading="lazy"
        format="webp"
      />

      <p
        v-if="contextualImage.caption"
        class="px-4 py-3 text-sm leading-relaxed text-muted-foreground"
      >
        {{ contextualImage.caption }}
      </p>
    </aside>
  </div>
</template>
