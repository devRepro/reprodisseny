<!-- components/marketing/product/ProductSections.vue -->
<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import ContentTabs from "@/components/marketing/content/ContentTabs.vue";
import ContentSectionsPanel from "@/components/marketing/content/ContentSectionsPanel.vue";

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

type ProductCardItem = {
  title?: string;
  description?: string;
  text?: string;
};

type ProductFormatsData = {
  intro?: string;
  shapes?: ProductCardItem[];
  deliveryFormats?: ProductCardItem[];
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
  items?: ProductCardItem[];
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
    showSectionNav: true,
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
      data.shapes?.some(
        (item) =>
          String(item?.title || "").trim() ||
          String(item?.description || item?.text || "").trim()
      ) ||
      data.deliveryFormats?.some(
        (item) =>
          String(item?.title || "").trim() ||
          String(item?.description || item?.text || "").trim()
      )
  );
}

function hasItems(section: ProductSection): boolean {
  return Boolean(
    section.items?.some(
      (item) =>
        String(item?.title || "").trim() ||
        String(item?.description || item?.text || "").trim()
    )
  );
}

function hasRenderableContent(section: ProductSection): boolean {
  if (Array.isArray(section.blocks) && section.blocks.length) return true;
  if (Array.isArray(section.content) && section.content.length) return true;
  if (hasItems(section)) return true;
  if (hasFormatsData(section)) return true;
  if (String(section.body ?? "").trim()) return true;
  if (String(section.text ?? "").trim()) return true;
  if (String(section.html ?? "").trim()) return true;

  return false;
}

function normalizeBlocks(section: ProductSection): ProductBlock[] {
  const rawBlocks = Array.isArray(section.blocks) ? section.blocks.filter(Boolean) : [];

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
      const intro = String(section.intro ?? "").trim();

      const items = Array.isArray(section.items)
        ? section.items.filter(
            (item) =>
              item &&
              (String(item.title || "").trim() ||
                String(item.description || item.text || "").trim())
          )
        : [];

      return {
        ...section,
        id: makeAnchorId(rawId, `seccion-${index + 1}`),
        title: String(section.title ?? `Sección ${index + 1}`).trim(),
        ...(intro ? { intro } : {}),
        ...(body ? { body, text: body } : {}),
        blocks: normalizeBlocks(section),
        ...(items.length ? { items } : {}),
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

const tabLeadById = computed<Record<string, string>>(() =>
  safeSections.value.reduce((acc, section) => {
    const intro = String(section.intro ?? "").trim();
    if (intro) acc[section.id] = intro;
    return acc;
  }, {} as Record<string, string>)
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

function getSectionLeadByTabId(tabId?: string | null): string {
  if (!tabId) return "";
  return tabLeadById.value[tabId] ?? "";
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
      section-class="space-y-0"
      panel-class="min-w-0"
    >
      <template #panel="{ item }">
        <div v-if="getSectionByTabId(item.id)" class="space-y-6 md:space-y-8">
          <p
            v-if="getSectionLeadByTabId(item.id)"
            class="max-w-3xl text-base leading-8 text-muted-foreground"
          >
            {{ getSectionLeadByTabId(item.id) }}
          </p>

          <ContentSectionsPanel
            :section="getSectionByTabId(item.id)"
            header-mode="none"
          />
        </div>
      </template>
    </ContentTabs>

    <div v-else class="space-y-10 md:space-y-12">
      <ContentSectionsPanel
        v-for="section in safeSections"
        :key="section.id"
        :section="section"
        header-mode="default"
      />
    </div>
  </div>
</template>
