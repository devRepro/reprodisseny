<script setup lang="ts">
import { computed, ref } from "vue";
import ContentTabs from "@/components/marketing/content/ContentTabs.vue";
import ContentTypesGrid from "@/components/marketing/content/ContentTypesGrid.vue";
import CategoryFormatsSection from "@/components/marketing/content/CategoryFormatsSection.vue";
import ContentBulletCards from "@/components/marketing/content/ContentBulletCards.vue";
import ContentDetailsSection from "@/components/marketing/content/ContentDetailsSection.vue";
import CategoryShowcaseCta from "@/components/marketing/category/CategoryShowcaseCta.vue";
import ContentFinishesSection from "@/components/marketing/content/ContentFinishesSection.vue";

type ContentBlock =
  | { type: "text"; text?: string; html?: boolean }
  | { type: "bullets"; items?: string[]; ordered?: boolean }
  | {
      type: "image";
      src?: string;
      alt?: string;
      width?: number;
      height?: number;
      caption?: string;
    };

type ContentFormatItem = {
  title: string;
  description: string;
};

type ContentFormatsData = {
  intro?: string;
  shapes?: ContentFormatItem[];
  deliveryFormats?: ContentFormatItem[];
};

type ContentTypeItem = {
  title: string;
  description: string;
  features?: string[];
  idealFor?: string;
};

type IncomingSection = {
  id?: string;
  key?: string;
  title?: string;
  intro?: string;
  items?: ContentTypeItem[];
  formatsData?: ContentFormatsData;
  blocks?: ContentBlock[];
  content?: ContentBlock[];
  text?: string;
  html?: string;
};

type SafeSection = {
  id: string;
  key?: string;
  title: string;
  intro?: string;
  items?: ContentTypeItem[];
  formatsData?: ContentFormatsData;
  blocks: ContentBlock[];
};

type BulletCardItem = {
  title: string;
  description: string;
};

type RenderSectionKind =
  | "details"
  | "types"
  | "formats"
  | "uses"
  | "finishes"
  | "default";

type RenderSection = {
  uid: string;
  kind: RenderSectionKind;
  section: SafeSection;
  bulletItems: BulletCardItem[];
  eyebrow?: string;
};

type TabItem = {
  id: string;
  label: string;
  disabled?: boolean;
};

const props = withDefaults(
  defineProps<{
    sections?: IncomingSection[];
    showSectionNav?: boolean;
    navOffset?: number;
    featuredProduct?: Record<string, unknown> | null;
  }>(),
  {
    sections: () => [],
    showSectionNav: false,
    navOffset: 136,
    featuredProduct: null,
  }
);

const activeTabId = ref("");

function makeAnchorId(value: string, fallback: string): string {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function normalizeSectionBlocks(section: IncomingSection): ContentBlock[] {
  if (Array.isArray(section.blocks) && section.blocks.length) {
    return section.blocks.filter(Boolean) as ContentBlock[];
  }

  if (Array.isArray(section.content) && section.content.length) {
    return section.content.filter(Boolean) as ContentBlock[];
  }

  const html = String(section.html ?? "").trim();
  if (html) return [{ type: "text", text: html, html: true }];

  const text = String(section.text ?? "").trim();
  if (text) return [{ type: "text", text, html: false }];

  return [];
}

const safeSections = computed<SafeSection[]>(() =>
  (props.sections || [])
    .map((section, index) => {
      const title = String(section?.title ?? "").trim();
      const key = String(section?.key ?? "").trim() || undefined;
      const intro = String(section?.intro ?? "").trim() || undefined;
      const items = Array.isArray(section?.items) ? section.items.filter(Boolean) : [];
      const blocks = normalizeSectionBlocks(section);

      const formatsData =
        section?.formatsData && typeof section.formatsData === "object"
          ? {
              intro: String(section.formatsData.intro ?? "").trim() || undefined,
              shapes: Array.isArray(section.formatsData.shapes)
                ? section.formatsData.shapes.filter(
                    (item) => item?.title && item?.description
                  )
                : [],
              deliveryFormats: Array.isArray(section.formatsData.deliveryFormats)
                ? section.formatsData.deliveryFormats.filter(
                    (item) => item?.title && item?.description
                  )
                : [],
            }
          : undefined;

      const hasFormatsData = Boolean(
        formatsData &&
          ((formatsData.shapes?.length ?? 0) > 0 ||
            (formatsData.deliveryFormats?.length ?? 0) > 0 ||
            formatsData.intro)
      );

      const hasContent = blocks.length > 0 || items.length > 0 || hasFormatsData;
      if (!title || !hasContent) return null;

      const rawId = String(section?.id ?? section?.key ?? "").trim();

      return {
        id: makeAnchorId(rawId || title, `seccion-${index + 1}`),
        key,
        title,
        ...(intro ? { intro } : {}),
        ...(items.length ? { items } : {}),
        ...(hasFormatsData ? { formatsData } : {}),
        blocks,
      };
    })
    .filter((section): section is SafeSection => Boolean(section))
);

function isText(block: ContentBlock): block is Extract<ContentBlock, { type: "text" }> {
  return block?.type === "text";
}

function isBullets(
  block: ContentBlock
): block is Extract<ContentBlock, { type: "bullets" }> {
  return (
    block?.type === "bullets" && Array.isArray(block.items) && block.items.length > 0
  );
}

function stripInlineMarkdown(value: string): string {
  return String(value ?? "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBulletCardItem(raw: string): BulletCardItem | null {
  const normalized = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;

  const boldTitleWithDesc = normalized.match(/^\*\*(.+?)\*\*\s*:\s*(.+)$/);
  if (boldTitleWithDesc) {
    return {
      title: stripInlineMarkdown(boldTitleWithDesc[1]),
      description: stripInlineMarkdown(boldTitleWithDesc[2]),
    };
  }

  const plainTitleWithDesc = normalized.match(/^([^:]{1,160})\s*:\s*(.+)$/);
  if (plainTitleWithDesc) {
    return {
      title: stripInlineMarkdown(plainTitleWithDesc[1]),
      description: stripInlineMarkdown(plainTitleWithDesc[2]),
    };
  }

  return {
    title: "",
    description: stripInlineMarkdown(normalized),
  };
}

function collectRawBulletItems(section: SafeSection): string[] {
  const fromBulletBlocks = section.blocks.flatMap((block) =>
    isBullets(block) ? block.items ?? [] : []
  );

  if (fromBulletBlocks.length) return fromBulletBlocks;

  const rawText = section.blocks
    .filter(
      (block): block is Extract<ContentBlock, { type: "text" }> =>
        isText(block) && !block.html && Boolean(block.text)
    )
    .map((block) => String(block.text ?? ""))
    .join("\n");

  if (!rawText.trim()) return [];

  return rawText
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").trim());
}

function getBulletCardItems(section: SafeSection): BulletCardItem[] {
  return collectRawBulletItems(section)
    .map(parseBulletCardItem)
    .filter((item): item is BulletCardItem => Boolean(item));
}

function isDetailsSection(section?: SafeSection | null) {
  const title = String(section?.title ?? "")
    .trim()
    .toLowerCase();

  return (
    section?.key === "details" ||
    section?.id === "details" ||
    title === "detalles" ||
    title === "detalles y características" ||
    title.startsWith("detalles")
  );
}

function getSectionKind(
  section: SafeSection,
  bulletItems: BulletCardItem[]
): RenderSectionKind {
  if (isDetailsSection(section)) return "details";

  if (
    section.key === "types" &&
    Array.isArray(section.items) &&
    section.items.length > 0
  ) {
    return "types";
  }

  if (section.key === "formats" && section.formatsData) {
    return "formats";
  }

  if (section.key === "finishes" && bulletItems.length > 0) {
    return "finishes";
  }

  if (section.key === "uses" && bulletItems.length > 0) {
    return "uses";
  }

  return "default";
}

const renderSections = computed<RenderSection[]>(() =>
  safeSections.value.map((section, index) => {
    const bulletItems = getBulletCardItems(section);
    const kind = getSectionKind(section, bulletItems);

    return {
      uid: section.id || `seccion-${index + 1}`,
      kind,
      section,
      bulletItems,
      eyebrow:
        section.key === "uses"
          ? "Aplicaciones"
          : section.key === "finishes"
          ? "Acabados"
          : "Información de la categoría",
    };
  })
);

const tabItems = computed<TabItem[]>(() =>
  renderSections.value.map((entry) => ({
    id: entry.uid,
    label: entry.section.title,
  }))
);

const renderSectionsById = computed<Record<string, RenderSection>>(() =>
  renderSections.value.reduce((acc, entry) => {
    acc[entry.uid] = entry;
    return acc;
  }, {} as Record<string, RenderSection>)
);

function getEntryByTabId(tabId?: string | null): RenderSection | null {
  if (!tabId) return null;
  return renderSectionsById.value[tabId] ?? null;
}

function getPanelEntries(item?: TabItem | null): RenderSection[] {
  if (!item?.id) return [];
  const entry = getEntryByTabId(item.id);
  return entry ? [entry] : [];
}
</script>

<template>
  <div v-if="renderSections.length" class="w-full">
    <ContentTabs
      v-model="activeTabId"
      :items="tabItems"
      aria-label="Información detallada"
      :keep-mounted="true"
      section-class="space-y-4 md:space-y-6"
      panel-class="min-w-0"
    >
      <template #panel="{ item }">
        <template v-for="entry in getPanelEntries(item)" :key="entry.uid">
          <template v-if="entry.kind === 'details'">
            <ContentDetailsSection
              :section="entry.section"
              eyebrow="Información de la categoría"
            />

            <CategoryShowcaseCta
              v-if="featuredProduct"
              class="mt-4 md:mt-6"
              :product="featuredProduct"
              :highlights="[
                'Ideal para packaging, retail y promociones.',
                'Disponible en distintos materiales y acabados.',
                'Solicita presupuesto desde la ficha del producto.',
              ]"
            />
          </template>

          <ContentTypesGrid
            v-else-if="entry.kind === 'types'"
            :section-id="entry.section.id"
            :title="entry.section.title"
            :intro="entry.section.intro"
            :items="entry.section.items || []"
          />

          <CategoryFormatsSection
            v-else-if="entry.kind === 'formats'"
            :section-id="entry.section.id"
            :title="entry.section.title"
            :data="entry.section.formatsData!"
          />

          <ContentFinishesSection
            v-else-if="entry.kind === 'finishes'"
            :section-id="entry.section.id"
            :title="entry.section.title"
            :intro="entry.section.intro"
            :items="entry.bulletItems"
          />

          <ContentBulletCards
            v-else-if="entry.kind === 'uses'"
            :section-id="entry.section.id"
            :eyebrow="entry.eyebrow"
            :title="entry.section.title"
            :intro="entry.section.intro"
            :items="entry.bulletItems"
            :columns="4"
          />

          <ContentDetailsSection
            v-else
            :section="entry.section"
            eyebrow="Información de la categoría"
          />
        </template>
      </template>
    </ContentTabs>
  </div>
</template>