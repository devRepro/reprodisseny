<script setup lang="ts">
import { computed, ref } from "vue";
import ContentTabs from "@/components/marketing/content/ContentTabs.vue";
import ContentDetailsSection from "@/components/marketing/content/ContentDetailsSection.vue";

type ProductBlock =
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

type ProductSection = {
  id?: string;
  key?: string;
  title?: string;
  intro?: string;
  blocks?: ProductBlock[];
  content?: ProductBlock[];
  text?: string;
  html?: string;
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

function hasRenderableContent(section: ProductSection): boolean {
  if (Array.isArray(section.blocks) && section.blocks.length) return true;
  if (Array.isArray(section.content) && section.content.length) return true;
  if (String(section.text ?? "").trim()) return true;
  if (String(section.html ?? "").trim()) return true;
  return false;
}

const safeSections = computed<ProductSection[]>(() =>
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

      return {
        ...section,
        id: makeAnchorId(rawId, `seccion-${index + 1}`),
      };
    })
);

const tabItems = computed<TabItem[]>(() =>
  safeSections.value.map((section) => ({
    id: section.id as string,
    label: String(section.title ?? ""),
  }))
);

const sectionsById = computed<Record<string, ProductSection>>(() =>
  safeSections.value.reduce((acc, section) => {
    if (section.id) acc[section.id] = section;
    return acc;
  }, {} as Record<string, ProductSection>)
);

function getSectionByTabId(tabId?: string | null): ProductSection | null {
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
