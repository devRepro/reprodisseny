<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  CategoryDetailSectionItem,
  ProductDetailSectionItem,
} from "~/server/services/cms/catalog.service";
import type {
  SectionInput,
} from "~/types/contentSections";
import ContentTabs from "@/components/marketing/content/ContentTabs.vue";
import ContentSectionsPanel from "@/components/marketing/content/ContentSectionsPanel.vue";

type DetailSectionItem = CategoryDetailSectionItem | ProductDetailSectionItem;

type ContentSectionsVariant = "product" | "category";

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

const props = withDefaults(
  defineProps<{
    sections?: DetailSectionItem[];
    variant?: ContentSectionsVariant;
    detailsMedia?: DetailsMediaItem | null;
    featuredProduct?: Record<string, unknown> | null;
  }>(),
  {
    sections: () => [],
    variant: "product",
    detailsMedia: null,
    featuredProduct: null,
  }
);

/**
 * Producto:
 * - La galería vive solo en el hero.
 * - No se pintan imágenes dentro de tabs.
 * - No mostramos "benefits" ni "types" como tabs de producto.
 */
const PRODUCT_SECTION_ORDER: CanonicalSectionId[] = [
  "details",
  "formats",
  "materials",
  "finishes",
  "applications",
  "technical-specs",
];

/**
 * Categoría:
 * - Puede conservar imagen SOLO en "details".
 * - Puede conservar "benefits" y "types" si aportan estructura.
 */
const CATEGORY_SECTION_ORDER: CanonicalSectionId[] = [
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

const activeSectionOrder = computed<CanonicalSectionId[]>(() =>
  props.variant === "category" ? CATEGORY_SECTION_ORDER : PRODUCT_SECTION_ORDER
);

const allowedSectionIds = computed(() => new Set(activeSectionOrder.value));

function normalizeLookupKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getCanonicalSectionId(section: DetailSectionItem): CanonicalSectionId | null {
  const source = section as Record<string, unknown>;

  const rawKind = normalizeLookupKey(source.kind);
  const rawId = normalizeLookupKey(source.id);
  const rawKey = normalizeLookupKey(source.key);

  return (
    SECTION_ALIASES[rawKind] ??
    SECTION_ALIASES[rawId] ??
    SECTION_ALIASES[rawKey] ??
    null
  );
}

function getSectionOrder(id: CanonicalSectionId) {
  const index = activeSectionOrder.value.indexOf(id);
  return index === -1 ? activeSectionOrder.value.length : index;
}

function hasRenderableContent(section: DetailSectionItem) {
  const source = section as Record<string, unknown>;

  if (String(source.body ?? "").trim()) return true;

  if (Array.isArray(source.items) && source.items.length) return true;

  if (source.benefitsData && typeof source.benefitsData === "object") return true;
  if (source.formatsData && typeof source.formatsData === "object") return true;
  if (source.materialsData && typeof source.materialsData === "object") return true;
  if (source.finishesData && typeof source.finishesData === "object") return true;
  if (source.applicationsData && typeof source.applicationsData === "object") return true;
  if (source.technicalSpecsData && typeof source.technicalSpecsData === "object") return true;

  return false;
}

function normalizeSection(section: DetailSectionItem): DetailSectionItem | null {
  const source = section as Record<string, unknown>;
  const id = getCanonicalSectionId(section);

  if (!id) return null;

  if (!allowedSectionIds.value.has(id)) {
    return null;
  }

  if (!hasRenderableContent(section)) {
    return null;
  }

  const title = String(source.title || SECTION_FALLBACK_LABELS[id]).trim();

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
  const sectionsByCanonicalId = new Map<CanonicalSectionId, DetailSectionItem>();

  for (const section of props.sections ?? []) {
    const normalizedSection = normalizeSection(section);

    if (!normalizedSection) continue;

    const id = normalizedSection.id as CanonicalSectionId;

    if (!sectionsByCanonicalId.has(id)) {
      sectionsByCanonicalId.set(id, normalizedSection);
    }
  }

  return Array.from(sectionsByCanonicalId.values()).sort(
    (a, b) =>
      getSectionOrder(a.id as CanonicalSectionId) -
      getSectionOrder(b.id as CanonicalSectionId)
  );
});

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

function getPanelDetailsMedia(sectionId: string) {
  if (sectionId !== "details") return null;

  return props.detailsMedia;
}

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
        :details-media="getPanelDetailsMedia(item.id)"
        :featured-product="featuredProduct"
        header-mode="none"
      />
    </template>
  </ContentTabs>
</template>