<!-- components/marketing/product/ProductSections.vue -->
<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import ContentTabs from "@/components/marketing/content/ContentTabs.vue";
import ContentDetailsSection from "@/components/marketing/content/ContentDetailsSection.vue";

type ProductBlock =
  | {
      type: "text";
      text?: string;
      html?: boolean;
      format?: string;
    }
  | {
      type: "bullets";
      items?: string[];
      ordered?: boolean;
    }
  | {
      type: "image";
      src?: string;
      alt?: string;
      width?: number;
      height?: number;
      caption?: string;
    };

type ProductFormatsData = {
  intro?: string;
  shapes?: Array<{
    title: string;
    description: string;
  }>;
  deliveryFormats?: Array<{
    title: string;
    description: string;
  }>;
};

type ProductSection = {
  id?: string;
  key?: string;
  title?: string;
  intro?: string;
  body?: string;
  text?: string;
  html?: string;
  blocks?: ProductBlock[];
  content?: ProductBlock[];
  items?: Array<Record<string, unknown>>;
  formatsData?: ProductFormatsData;
};

type SafeProductSection = ProductSection & {
  id: string;
  title: string;
  blocks: ProductBlock[];
};

type TabItem = {
  id: string;
  label: string;
};

const props = withDefaults(
  defineProps<{
    sections?: ProductSection[];
    showSectionNav?: boolean;
  }>(),
  {
    sections: () => [],
    showSectionNav: false,
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

function hasFormatsData(section: ProductSection): boolean {
  const data = section.formatsData;
  if (!data || typeof data !== "object") return false;

  return Boolean(
    String(data.intro || "").trim() ||
      data.shapes?.length ||
      data.deliveryFormats?.length
  );
}

function hasRenderableContent(section: ProductSection): boolean {
  if (Array.isArray(section.blocks) && section.blocks.length) return true;
  if (Array.isArray(section.content) && section.content.length) return true;
  if (Array.isArray(section.items) && section.items.length) return true;
  if (hasFormatsData(section)) return true;
  if (String(section.body ?? "").trim()) return true;
  if (String(section.text ?? "").trim()) return true;
  if (String(section.html ?? "").trim()) return true;

  return false;
}

function normalizeBlocks(section: ProductSection): ProductBlock[] {
  const rawBlocks = Array.isArray(section.blocks)
    ? section.blocks.filter(Boolean)
    : [];

  if (rawBlocks.length) return rawBlocks;

  const contentBlocks = Array.isArray(section.content)
    ? section.content.filter(Boolean)
    : [];

  if (contentBlocks.length) return contentBlocks;

  const html = String(section.html ?? "").trim();
  if (html) {
    return [
      {
        type: "text",
        text: html,
        html: true,
        format: "html",
      },
    ];
  }

  const text = String(section.body ?? section.text ?? "").trim();
  if (text) {
    return [
      {
        type: "text",
        text,
        html: false,
      },
    ];
  }

  return [];
}

const safeSections = computed<SafeProductSection[]>(() =>
  (props.sections || [])
    .filter((section): section is ProductSection =>
      Boolean(
        section &&
          typeof section === "object" &&
          String(section.title ?? "").trim() &&
          hasRenderableContent(section)
      )
    )
    .map((section, index) => {
      const rawId = String(section.id ?? section.key ?? section.title ?? "").trim();
      const body = String(section.body ?? section.text ?? "").trim();

      return {
        ...section,
        id: makeAnchorId(rawId, `seccion-${index + 1}`),
        title: String(section.title ?? `Sección ${index + 1}`).trim(),
        blocks: normalizeBlocks(section),
        ...(body ? { body, text: body } : {}),
      };
    })
);

const tabItems = computed<TabItem[]>(() =>
  safeSections.value.map((section) => ({
    id: section.id,
    label: section.title,
  }))
);

const sectionsById = computed<Record<string, SafeProductSection>>(() =>
  safeSections.value.reduce((acc, section) => {
    acc[section.id] = section;
    return acc;
  }, {} as Record<string, SafeProductSection>)
);

watchEffect(() => {
  const firstTabId = safeSections.value[0]?.id || "";

  if (!firstTabId) {
    activeTabId.value = "";
    return;
  }

  const activeExists = safeSections.value.some(
    (section) => section.id === activeTabId.value
  );

  if (!activeExists) {
    activeTabId.value = firstTabId;
  }
});

function getSectionByTabId(tabId?: string | null): SafeProductSection | null {
  if (!tabId) return null;
  return sectionsById.value[tabId] ?? null;
}
</script>

<template>
  <div v-if="safeSections.length" class="w-full">
    <ContentTabs
      v-if="showSectionNav && safeSections.length > 1"
      v-model="activeTabId"
      :items="tabItems"
      aria-label="Información del producto"
      :keep-mounted="true"
      section-class="space-y-6 md:space-y-8"
      panel-class="min-w-0"
    >
      <template #panel="{ item }">
        <ContentDetailsSection
          v-if="getSectionByTabId(item.id)"
          :section="getSectionByTabId(item.id)"
          eyebrow="Información del producto"
        />
      </template>
    </ContentTabs>

    <div v-else class="space-y-10 md:space-y-12">
      <ContentDetailsSection
        v-for="section in safeSections"
        :key="section.id"
        :section="section"
        eyebrow="Información del producto"
      />
    </div>
  </div>
</template>