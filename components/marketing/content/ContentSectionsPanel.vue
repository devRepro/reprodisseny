<script setup lang="ts">
import { computed } from "vue";
import type { CategoryCardGroup } from "~/server/services/cms/catalog.service";
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

type SectionInput = {
  id: string;
  key?: string;
  kind?: string;
  title?: string;
  intro?: string;
  body?: string;
  text?: string;
  html?: string;

  items?: Array<{
    title?: string;
    description?: string;
    text?: string;
    meta?: string;
    tags?: string[];
  }>;

  cardGroups?: CategoryCardGroup[];

  benefitsData?: {
    benefits?: unknown[];
  } | null;

  materialsData?: {
    materials?: unknown[];
  } | null;

  formatsData?: {
    intro?: string;
    shapes?: unknown[];
    deliveryFormats?: unknown[];
  } | null;

  finishesData?: {
    finishes?: unknown[];
  } | null;

  applicationsData?: {
    applications?: unknown[];
  } | null;
};

const props = withDefaults(
  defineProps<{
    section: SectionInput;
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
  if (key === "use") return "applications";
  if (key === "aplicaciones") return "applications";
  if (key === "acabados") return "finishes";
  if (key === "formatos") return "formats";
  if (key === "materiales") return "materials";
  if (key === "beneficios") return "benefits";
  if (key === "tipos") return "types";
  if (key === "detalles") return "details";

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
  props.headerMode === "default" ? String(props.section.title || "").trim() : ""
);

const resolvedIntro = computed(() => {
  if (props.headerMode === "none") return undefined;

  const intro = String(props.section?.intro || "").trim();
  return intro || undefined;
});

const hasExistingCardGroups = computed(() =>
  Boolean(
    props.section.cardGroups?.some(
      (group) => Array.isArray(group.items) && group.items.length > 0
    )
  )
);

const resolvedKind = computed(() => {
  const key = normalizedKey.value;

  if (key === "details") return "details";
  if (key === "types") return "types";

  if (
    key === "benefits" ||
    key === "materials" ||
    key === "formats" ||
    key === "finishes" ||
    key === "applications" ||
    hasExistingCardGroups.value
  ) {
    return "cards";
  }

  return "default";
});

const resolvedTypeItems = computed(() =>
  Array.isArray(props.section?.items)
    ? props.section.items
        .map((item) => {
          const title = String(item?.title || "").trim();
          const description = String(item?.description || item?.text || "").trim();

          if (!title || !description) return null;

          return {
            ...item,
            title,
            description,
          };
        })
        .filter((item): item is NormalizedCardItem => Boolean(item))
    : []
);

function stripMarkdownStrong(value: string) {
  return String(value || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .trim();
}

function toCardItems(value: unknown, metaLabel?: string): NormalizedCardItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;
      const title = stripMarkdownStrong(String(record.title || "").trim());
      const description = stripMarkdownStrong(
        String(record.description || record.text || "").trim()
      );

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

  const existingGroups = Array.isArray(section.cardGroups)
    ? section.cardGroups.filter(
        (group) => Array.isArray(group.items) && group.items.length > 0
      )
    : [];

  if (existingGroups.length) return existingGroups;

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
    const finishItems = toCardItems(section.finishesData?.finishes, "Acabado");
    const items = finishItems.length
      ? finishItems
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
    const applicationItems = toCardItems(section.applicationsData?.applications);
    const items = applicationItems.length
      ? applicationItems
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

const shouldShowDetailsHeader = computed(() => props.headerMode === "default");
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
    :show-header="props.headerMode === 'default'"
  />

  <ContentCardsSection
    v-else-if="resolvedKind === 'cards' && resolvedCardGroups.length"
    :section-id="props.section.id"
    :title="resolvedTitle"
    :intro="resolvedIntro"
    :eyebrow="resolvedEyebrow"
    :groups="resolvedCardGroups"
    :variant="resolvedVariant"
    :show-header="props.headerMode === 'default'"
  />

  <ContentDetailsSection
    v-else
    :section="props.section"
    :show-header="shouldShowDetailsHeader"
  />
</template>
