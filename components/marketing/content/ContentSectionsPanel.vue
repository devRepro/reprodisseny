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

type CardItem = {
  id?: string;
  title?: string;
  description?: string;
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
  const key = String(value || "").trim().toLowerCase();

  if (key === "applications") return "uses";
  return key;
}

function eyebrowForCards(key?: string) {
  const value = normalizeSectionKey(key);

  if (value === "formats") return "Formatos y soportes";
  if (value === "finishes") return "Opciones de acabado";
  if (value === "uses") return "Aplicaciones";

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
  const explicitKind = String((props.section as { kind?: string })?.kind || "")
    .trim()
    .toLowerCase();

  if (explicitKind) return explicitKind;

  const key = normalizeSectionKey(sectionKey.value);

  if (key === "details") return "details";
  if (key === "types") return "types";
  if (key === "formats" || key === "finishes" || key === "uses") {
    return "cards";
  }

  return "default";
});

const resolvedTypeItems = computed(() =>
  Array.isArray(props.section?.items)
    ? props.section.items.filter(
        (item) =>
          item &&
          String(item.title || "").trim() &&
          String(item.description || "").trim()
      )
    : []
);

function stripMarkdownStrong(value: string) {
  return String(value || "").replace(/\*\*(.*?)\*\*/g, "$1").trim();
}

function parseBulletToCardItem(
  raw: string,
  index: number,
  metaLabel?: string
): CardItem | null {
  const text = String(raw || "").trim();
  if (!text) return null;

  const normalized = stripMarkdownStrong(text);
  const match = normalized.match(/^([^:]+):\s*(.+)$/);

  if (match) {
    return {
      id: `item-${index + 1}`,
      title: match[1]?.trim() || "",
      description: match[2]?.trim() || "",
      ...(metaLabel
        ? { meta: `${metaLabel} ${String(index + 1).padStart(2, "0")}` }
        : {}),
    };
  }

  return {
    id: `item-${index + 1}`,
    description: normalized,
    ...(metaLabel
      ? { meta: `${metaLabel} ${String(index + 1).padStart(2, "0")}` }
      : {}),
  };
}

function blocksToCardGroups(section: CategoryDetailSectionItem): CategoryCardGroup[] {
  const blocks = Array.isArray(section?.blocks) ? section.blocks : [];

  const bulletBlock = blocks.find(
    (block) =>
      block &&
      block.type === "bullets" &&
      Array.isArray(block.items) &&
      block.items.length
  );

  if (!bulletBlock || !Array.isArray(bulletBlock.items)) return [];

  const normalizedKey = normalizeSectionKey(sectionKey.value);
  const metaLabel = normalizedKey === "finishes" ? "Acabado" : undefined;

  const items = bulletBlock.items
    .map((item, index) =>
      parseBulletToCardItem(String(item || ""), index, metaLabel)
    )
    .filter((item): item is CardItem => Boolean(item));

  if (!items.length) return [];

  return [
    {
      id: `${section.id}-group-1`,
      columns: 2,
      items,
    },
  ];
}

const resolvedCardGroups = computed<CategoryCardGroup[]>(() => {
  const existing = Array.isArray(props.section?.cardGroups)
    ? props.section.cardGroups
        .map((group, groupIndex) => {
          const id = String(group?.id || `group-${groupIndex + 1}`).trim();
          const title = String(group?.title || "").trim() || undefined;
          const description =
            String(group?.description || "").trim() || undefined;

          const items = Array.isArray(group?.items)
            ? group.items.filter(
                (item) =>
                  item &&
                  String(item.title || "").trim() &&
                  String(item.description || "").trim()
              )
            : [];

          if (!id || !items.length) return null;

          return {
            ...group,
            id,
            ...(title ? { title } : {}),
            ...(description ? { description } : {}),
            items,
          };
        })
        .filter((group): group is CategoryCardGroup => Boolean(group))
    : [];

  if (existing.length) return existing;

  return blocksToCardGroups(props.section);
});

const resolvedEyebrow = computed(() => {
  if (props.headerMode !== "default") return "";
  return eyebrowForCards(sectionKey.value);
});

const resolvedVariant = computed(() => variantForCards(sectionKey.value));
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
</template>~/server/services/cms/_catalog.service