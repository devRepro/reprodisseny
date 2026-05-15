<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  CategoryDetailSectionItem,
  ProductDetailSectionItem,
} from "~/server/services/cms/catalog.service";

import ContentTabs from "@/components/marketing/content/ContentTabs.vue";
import ContentSectionsPanel from "@/components/marketing/content/ContentSectionsPanel.vue";

type DetailSectionItem = CategoryDetailSectionItem | ProductDetailSectionItem;

type CanonicalSectionId =
  | "details"
  | "benefits"
  | "types"
  | "formats"
  | "materials"
  | "finishes"
  | "applications"
  | "technical-specs";

type DetailsMediaItem = {
  image?: {
    src?: string;
    alt?: string;
    caption?: string;
  } | null;
  pills?: Array<{
    label?: string;
    to?: string;
  }>;
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
    sections?: DetailSectionItem[];
    detailsMedia?: DetailsMediaItem | null;
    featuredProduct?: Record<string, unknown> | null;
    galleryImages?: GalleryImage[];
  }>(),
  {
    sections: () => [],
    detailsMedia: null,
    featuredProduct: null,
    galleryImages: () => [],
  }
);

const SECTION_ORDER: CanonicalSectionId[] = [
  "details",
  "benefits",
  "types",
  "formats",
  "materials",
  "finishes",
  "applications",
  "technical-specs",
];

const SECTION_FALLBACK_LABELS: Record<CanonicalSectionId, string> = {
  details: "Detalles",
  benefits: "Beneficios",
  types: "Tipos",
  formats: "Formatos y soportes",
  materials: "Materiales",
  finishes: "Acabados",
  applications: "Aplicaciones",
  "technical-specs": "Características técnicas",
};

const SECTION_ALIASES: Record<string, CanonicalSectionId> = {
  details: "details",
  detail: "details",
  detalles: "details",
  detailsmd: "details",
  bodymd: "details",
  description: "details",
  descripcion: "details",

  benefits: "benefits",
  benefit: "benefits",
  beneficios: "benefits",
  benefitsdata: "benefits",
  benefitsmd: "benefits",

  types: "types",
  type: "types",
  tipos: "types",
  typesmd: "types",
  typesdata: "types",

  formats: "formats",
  format: "formats",
  formatos: "formats",
  soportes: "formats",
  formatsmd: "formats",
  formatsdata: "formats",
  "formatos-y-soportes": "formats",

  materials: "materials",
  material: "materials",
  materiales: "materials",
  materialsmd: "materials",
  materialsdata: "materials",

  finishes: "finishes",
  finish: "finishes",
  acabados: "finishes",
  finishesmd: "finishes",
  finishesdata: "finishes",

  applications: "applications",
  application: "applications",
  aplicaciones: "applications",
  uses: "applications",
  use: "applications",
  usos: "applications",
  usesmd: "applications",
  applicationsmd: "applications",
  applicationsdata: "applications",

  "technical-specs": "technical-specs",
  technicalspecs: "technical-specs",
  technicalspecsmd: "technical-specs",
  technicalspecsdata: "technical-specs",
  caracteristicastecnicas: "technical-specs",
  "caracteristicas-tecnicas": "technical-specs",
};

function normalizeLookupKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getCanonicalSectionId(section: DetailSectionItem): string {
  const source = section as Record<string, unknown>;

  const rawKind = normalizeLookupKey(source.kind);
  const rawId = normalizeLookupKey(source.id);
  const rawKey = normalizeLookupKey(source.key);

  return (
    SECTION_ALIASES[rawKind] ??
    SECTION_ALIASES[rawId] ??
    SECTION_ALIASES[rawKey] ??
    rawKind ??
    rawId ??
    rawKey
  );
}

function getSectionOrder(id: string) {
  const index = SECTION_ORDER.indexOf(id as CanonicalSectionId);
  return index === -1 ? SECTION_ORDER.length : index;
}

function normalizeSection(section: DetailSectionItem): DetailSectionItem | null {
  const source = section as Record<string, unknown>;
  const id = getCanonicalSectionId(section);

  if (!id) return null;

  const fallbackTitle =
    SECTION_FALLBACK_LABELS[id as CanonicalSectionId] ?? String(source.title ?? "");

  const title = String(source.title || fallbackTitle).trim();

  if (!title) return null;

  return {
    ...section,
    id,
    key: id,
    kind: id,
    title,
  } as DetailSectionItem;
}

const safeSections = computed<DetailSectionItem[]>(() => {
  const sectionsByCanonicalId = new Map<string, DetailSectionItem>();

  for (const section of props.sections ?? []) {
    const normalizedSection = normalizeSection(section);

    if (!normalizedSection) continue;

    if (!sectionsByCanonicalId.has(normalizedSection.id)) {
      sectionsByCanonicalId.set(normalizedSection.id, normalizedSection);
    }
  }

  return Array.from(sectionsByCanonicalId.values()).sort(
    (a, b) => getSectionOrder(a.id) - getSectionOrder(b.id)
  );
});

const safeGalleryImages = computed(() =>
  (props.galleryImages ?? []).filter((image) => String(image?.src || "").trim())
);

const tabItems = computed(() =>
  safeSections.value.map((section) => ({
    id: section.id,
    label: section.title,
  }))
);

const sectionsById = computed(() =>
  safeSections.value.reduce((acc, section) => {
    acc[section.id] = section;
    return acc;
  }, {} as Record<string, DetailSectionItem>)
);

const activeTabId = ref("");

watch(
  () => safeSections.value.map((section) => section.id).join("|"),
  () => {
    const ids = safeSections.value.map((section) => section.id);

    if (!ids.length) {
      activeTabId.value = "";
      return;
    }

    if (!activeTabId.value || !ids.includes(activeTabId.value)) {
      activeTabId.value = ids[0];
    }
  },
  { immediate: true }
);
</script>

<template>
  <pre class="mb-4 rounded-xl bg-black p-4 text-xs text-white">
galleryImages: {{ safeGalleryImages }}
</pre
  >
  <ContentTabs
    v-if="safeSections.length"
    v-model="activeTabId"
    :items="tabItems"
    aria-label="Información detallada"
    :keep-mounted="true"
    section-class="space-y-0"
    panel-class="min-w-0"
  >
    <template #panel="{ item }">
      <ContentSectionsPanel
        v-if="sectionsById[item.id]"
        :section="sectionsById[item.id]"
        :details-media="detailsMedia"
        :featured-product="featuredProduct"
        :gallery-images="safeGalleryImages"
        header-mode="none"
      />
    </template>
  </ContentTabs>
</template>
