<script setup lang="ts">
import { computed } from "vue";
import type {
  CategoryCardGroup,
  CategoryDetailSectionItem,
} from "~/server/services/cms/catalog.service";
import ContentTypesGrid from "@/components/marketing/content/ContentTypesGrid.vue";
import ContentDetailsSection from "@/components/marketing/content/ContentDetailsSection.vue";
import ContentDetailsTabPanel from "@/components/marketing/content/ContentDetailsTabPanel.vue";
import ContentCardsSection from "@/components/marketing/content/ContentCardsSection.vue";

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

type NormalizedCardItem = {
  title: string;
  description: string;
  meta?: string;
  tags?: string[];
};

const props = withDefaults(
  defineProps<{
    section: CategoryDetailSectionItem;
    detailsMedia?: DetailsMediaItem | null;
    featuredProduct?: Record<string, unknown> | null;
    headerMode?: "default" | "intro-only" | "none";
  }>(),
  {
    detailsMedia: null,
    featuredProduct: null,
    headerMode: "default",
  }
);

const sectionKey = computed(() =>
  String(props.section?.key || props.section?.id || "")
    .trim()
    .toLowerCase()
);

function normalizeSectionKey(value?: string) {
  const key = String(value || "")
    .trim()
    .toLowerCase();

  if (key === "uses") return "applications";
  return key;
}

const normalizedKey = computed(() => {
  const kind = String(props.section?.kind || "")
    .trim()
    .toLowerCase();

  return normalizeSectionKey(kind || sectionKey.value);
});

function eyebrowForCards(key?: string) {
  const value = normalizeSectionKey(key);

  if (value === "formats") return "Formatos y soportes";
  if (value === "finishes") return "Opciones de acabado";
  if (value === "applications") return "Aplicaciones";
  if (value === "materials") return "Materiales";
  if (value === "benefits") return "Beneficios";

  return "";
}

function variantForCards(key?: string) {
  const value = normalizeSectionKey(key);
  return value === "finishes" ? "feature" : "default";
}

const resolvedTitle = computed(() =>
  props.headerMode === "default" ? props.section.title : ""
);

const resolvedIntro = computed(() => {
  if (props.headerMode === "none") return undefined;

  const intro = String(props.section?.intro || "").trim();
  return intro || undefined;
});

const resolvedKind = computed(() => {
  const key = normalizedKey.value;

  if (key === "details") return "details";
  if (key === "types") return "types";

  if (
    key === "benefits" ||
    key === "materials" ||
    key === "formats" ||
    key === "finishes" ||
    key === "applications"
  ) {
    return "cards";
  }

  return "default";
});

const resolvedTypeItems = computed(() =>
  Array.isArray(props.section?.items)
    ? props.section.items.filter(
        (item) =>
          item && String(item.title || "").trim() && String(item.description || "").trim()
      )
    : []
);

function toCardItems(value: unknown, metaLabel?: string): NormalizedCardItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;
      const title = String(record.title || "").trim();
      const description = String(record.description || "").trim();

      if (!title || !description) return null;

      return {
        title,
        description,
        ...(metaLabel
          ? { meta: `${metaLabel} ${String(index + 1).padStart(2, "0")}` }
          : {}),
      };
    })
    .filter((item): item is NormalizedCardItem => Boolean(item));
}

function stripMarkdownStrong(value: string) {
  return String(value || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .trim();
}

function parseBodyBulletItems(body: unknown, metaLabel?: string): NormalizedCardItem[] {
  const raw = String(body || "").trim();
  if (!raw) return [];

  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line, index) => {
      const clean = stripMarkdownStrong(line.replace(/^[-*]\s+/, ""));
      const match = clean.match(/^([^:]+):\s*(.+)$/);

      if (match) {
        return {
          title: match[1]?.trim() || "",
          description: match[2]?.trim() || "",
          ...(metaLabel
            ? { meta: `${metaLabel} ${String(index + 1).padStart(2, "0")}` }
            : {}),
        };
      }

      return {
        title: "",
        description: clean,
        ...(metaLabel
          ? { meta: `${metaLabel} ${String(index + 1).padStart(2, "0")}` }
          : {}),
      };
    })
    .filter((item) => item.title || item.description)
    .map((item, index) => ({
      title: item.title || `Opción ${index + 1}`,
      description: item.description,
      ...(item.meta ? { meta: item.meta } : {}),
    }));
}

const resolvedCardGroups = computed<CategoryCardGroup[]>(() => {
  const section = props.section;
  const key = normalizedKey.value;

  if (key === "benefits") {
    const items = toCardItems(section.benefitsData?.benefits);
    if (!items.length) return [];

    return [
      {
        id: `${section.id}-benefits`,
        items,
        columns: 3,
      },
    ];
  }

  if (key === "materials") {
    const items = toCardItems(section.materialsData?.materials);
    if (!items.length) return [];

    return [
      {
        id: `${section.id}-materials`,
        items,
        columns: 3,
      },
    ];
  }

  if (key === "formats") {
    const shapes = toCardItems(section.formatsData?.shapes);
    const deliveryFormats = toCardItems(section.formatsData?.deliveryFormats);

    const groups: CategoryCardGroup[] = [];

    if (shapes.length) {
      groups.push({
        id: `${section.id}-shapes`,
        title: "Formatos",
        items: shapes,
        columns: 3,
      });
    }

    if (deliveryFormats.length) {
      groups.push({
        id: `${section.id}-delivery-formats`,
        title: "Entrega y presentación",
        items: deliveryFormats,
        columns: 3,
      });
    }

    if (groups.length) return groups;

    const fallbackItems = parseBodyBulletItems(section.body);
    if (!fallbackItems.length) return [];

    return [
      {
        id: `${section.id}-formats`,
        items: fallbackItems,
        columns: 3,
      },
    ];
  }

  if (key === "finishes") {
    const items =
      toCardItems(section.finishesData?.finishes, "Acabado").length > 0
        ? toCardItems(section.finishesData?.finishes, "Acabado")
        : parseBodyBulletItems(section.body, "Acabado");

    if (!items.length) return [];

    return [
      {
        id: `${section.id}-finishes`,
        items,
        columns: 2,
      },
    ];
  }

  if (key === "applications") {
    const items =
      toCardItems(section.applicationsData?.applications).length > 0
        ? toCardItems(section.applicationsData?.applications)
        : parseBodyBulletItems(section.body);

    if (!items.length) return [];

    return [
      {
        id: `${section.id}-applications`,
        items,
        columns: 2,
      },
    ];
  }

  return [];
});

const resolvedEyebrow = computed(() => {
  if (props.headerMode !== "default") return "";
  return eyebrowForCards(normalizedKey.value);
});

const resolvedVariant = computed(() => variantForCards(normalizedKey.value));
</script>

<template>
  <ContentDetailsTabPanel
    v-if="resolvedKind === 'details'"
    :section="props.section"
    :details-media="props.detailsMedia"
    :featured-product="props.featuredProduct"
    :header-mode="props.headerMode"
  />

  <ContentTypesGrid
    v-else-if="resolvedKind === 'types' && resolvedTypeItems.length"
    :section-id="props.section.id"
    :title="resolvedTitle"
    :intro="resolvedIntro"
    :items="resolvedTypeItems"
  />

  <ContentCardsSection
    v-else-if="resolvedKind === 'cards' && resolvedCardGroups.length"
    :section-id="props.section.id"
    :title="resolvedTitle"
    :intro="resolvedIntro"
    :eyebrow="resolvedEyebrow"
    :groups="resolvedCardGroups"
    :variant="resolvedVariant"
  />

  <ContentDetailsSection
    v-else
    :section="props.section"
    :header-mode="props.headerMode"
  />
</template>
