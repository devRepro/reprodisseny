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
  contentFormat?: string;

  items?: Array<{
    title?: string;
    description?: string;
    text?: string;
    meta?: string;
    tags?: string[];
    features?: string[];
    idealFor?: string;
  }>;

  cardGroups?: CategoryCardGroup[];

  benefitsData?: {
    intro?: string;
    benefits?: unknown[];
  } | null;

  materialsData?: {
    intro?: string;
    materials?: unknown[];
  } | null;

  formatsData?: {
    intro?: string;
    shapes?: unknown[];
    deliveryFormats?: unknown[];
  } | null;

  finishesData?: {
    intro?: string;
    finishes?: unknown[];
  } | null;

  applicationsData?: {
    intro?: string;
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

  if (key === "technical-specs") return "technical-specs";
  if (key === "technicalspecs") return "technical-specs";
  if (key === "technical") return "technical-specs";
  if (key === "specs") return "technical-specs";
  if (key === "caracteristicas") return "technical-specs";
  if (key === "caracteristicas-tecnicas") return "technical-specs";
  if (key === "especificaciones") return "technical-specs";
  if (key === "especificaciones-tecnicas") return "technical-specs";

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

function parseJsonObject(value: unknown): Record<string, unknown> | null {
  const raw = String(value || "").trim();

  if (!raw || !raw.startsWith("{")) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

const parsedBodyData = computed(() =>
  parseJsonObject(props.section?.body || props.section?.text)
);

function introFromKnownData(section: SectionInput, key: string) {
  if (key === "benefits") {
    return String(section.benefitsData?.intro || "").trim();
  }

  if (key === "materials") {
    return String(section.materialsData?.intro || "").trim();
  }

  if (key === "formats") {
    return String(section.formatsData?.intro || "").trim();
  }

  if (key === "finishes") {
    return String(section.finishesData?.intro || "").trim();
  }

  if (key === "applications") {
    return String(section.applicationsData?.intro || "").trim();
  }

  return "";
}

const resolvedIntro = computed(() => {
  if (props.headerMode === "none") return undefined;

  const sectionIntro = String(props.section?.intro || "").trim();
  const dataIntro = introFromKnownData(props.section, normalizedKey.value);
  const jsonIntro = String(parsedBodyData.value?.intro || "").trim();

  return sectionIntro || dataIntro || jsonIntro || undefined;
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
  if (key === "technical-specs") return "technical-specs";

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

function normalizeMarkdownLine(value: string) {
  return stripMarkdownStrong(
    String(value || "")
      .replace(/^[-*•·]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      .trim()
  );
}

function toCardItems(value: unknown, metaLabel?: string): NormalizedCardItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;

      const title = stripMarkdownStrong(
        String(record.title || record.name || record.label || "").trim()
      );

      const description = stripMarkdownStrong(
        String(record.description || record.text || record.body || "").trim()
      );

      const tags = Array.isArray(record.tags)
        ? record.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
        : Array.isArray(record.features)
          ? record.features.map((tag) => String(tag || "").trim()).filter(Boolean)
          : [];

      if (!title || !description) return null;

      return {
        title,
        description,
        ...(metaLabel
          ? { meta: `${metaLabel} ${String(index + 1).padStart(2, "0")}` }
          : {}),
        ...(tags.length ? { tags } : {}),
      };
    })
    .filter((item): item is NormalizedCardItem => Boolean(item));
}

function toCardItemsFromJsonKey(key: string, metaLabel?: string): NormalizedCardItem[] {
  return toCardItems(parsedBodyData.value?.[key], metaLabel);
}

function parseBodyBulletItems(body: unknown, metaLabel?: string): NormalizedCardItem[] {
  const raw = String(body || "").trim();

  if (!raw || raw.startsWith("{")) return [];

  const lines = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^#{1,6}\s+/.test(line));

  if (!lines.length) return [];

  const bulletLines = lines.filter((line) => /^[-*•·]\s+/.test(line));

  /*
   * Si hay bullets Markdown, usamos solo bullets.
   * Si no hay bullets, aceptamos líneas tipo:
   * Título: descripción
   * porque muchos productos actuales vienen así desde SharePoint.
   */
  const candidateLines = bulletLines.length
    ? bulletLines
    : lines.filter((line) => /^.{2,90}:\s+.+/.test(normalizeMarkdownLine(line)));

  return candidateLines
    .map((line, index) => {
      const original = String(line || "").trim();
      const withoutBullet = original.replace(/^[-*•·]\s+/, "").trim();

      const strongMatch = withoutBullet.match(/^\*\*([^*]+)\*\*:?\s*(.+)$/);
      const clean = normalizeMarkdownLine(original);
      const colonMatch = clean.match(/^([^:]{2,90}):\s*(.+)$/);

      const title = String(strongMatch?.[1] || colonMatch?.[1] || "").trim();
      const description = String(strongMatch?.[2] || colonMatch?.[2] || clean).trim();

      if (!description) return null;

      return {
        title: title || `Opción ${index + 1}`,
        description,
        ...(metaLabel
          ? { meta: `${metaLabel} ${String(index + 1).padStart(2, "0")}` }
          : {}),
      };
    })
    .filter((item): item is NormalizedCardItem => Boolean(item));
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
    const benefitsDataItems = toCardItems(section.benefitsData?.benefits);
    const jsonItems = toCardItemsFromJsonKey("benefits");
    const markdownItems = parseBodyBulletItems(section.body || section.text);

    const items = benefitsDataItems.length
      ? benefitsDataItems
      : jsonItems.length
        ? jsonItems
        : markdownItems;

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
    const materialItems = toCardItems(section.materialsData?.materials);
    const jsonItems = toCardItemsFromJsonKey("materials");
    const markdownItems = parseBodyBulletItems(section.body || section.text, "Material");

    const items = materialItems.length
      ? materialItems
      : jsonItems.length
        ? jsonItems
        : markdownItems;

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
    const shapesDataItems = toCardItems(section.formatsData?.shapes);
    const deliveryDataItems = toCardItems(section.formatsData?.deliveryFormats);

    const shapes = shapesDataItems.length
      ? shapesDataItems
      : toCardItemsFromJsonKey("shapes");

    const deliveryFormats = deliveryDataItems.length
      ? deliveryDataItems
      : toCardItemsFromJsonKey("deliveryFormats");

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

    const fallbackItems = parseBodyBulletItems(section.body || section.text);
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
    const jsonItems = toCardItemsFromJsonKey("finishes", "Acabado");
    const markdownItems = parseBodyBulletItems(section.body || section.text, "Acabado");

    const items = finishItems.length
      ? finishItems
      : jsonItems.length
        ? jsonItems
        : markdownItems;

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
    const jsonItems = toCardItemsFromJsonKey("applications");
    const markdownItems = parseBodyBulletItems(section.body || section.text);

    const items = applicationItems.length
      ? applicationItems
      : jsonItems.length
        ? jsonItems
        : markdownItems;

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
    v-else-if="resolvedKind === 'technical-specs'"
    :section="props.section"
    :show-header="shouldShowDetailsHeader"
  />

  <ContentDetailsSection
    v-else
    :section="props.section"
    :show-header="shouldShowDetailsHeader"
  />
</template>