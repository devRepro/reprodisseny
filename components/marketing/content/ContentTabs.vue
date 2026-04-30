<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  CategoryCardGroup,
  CategoryDetailSectionItem,
} from "~/server/services/cms/catalog.service";
import ContentTabs from "@/components/marketing/content/ContentTabs.vue";
import ContentSectionsPanel from "@/components/marketing/content/ContentSectionsPanel.vue";

type TabItem = {
  id: string;
  label: string;
  disabled?: boolean;
};

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

type SafeSection = CategoryDetailSectionItem & {
  cardGroups?: CategoryCardGroup[];
};

const props = withDefaults(
  defineProps<{
    sections?: CategoryDetailSectionItem[];
    detailsMedia?: DetailsMediaItem | null;
    featuredProduct?: Record<string, unknown> | null;
  }>(),
  {
    sections: () => [],
    detailsMedia: null,
    featuredProduct: null,
  }
);

const activeTabId = ref("");

const safeSections = computed<SafeSection[]>(() =>
  (props.sections ?? [])
    .map((section, index) => {
      const id = String(section?.id || section?.key || `section-${index + 1}`).trim();
      const title = String(section?.title ?? "").trim();
      const intro = String(section?.intro ?? "").trim() || undefined;
      const key = String(section?.key ?? "").trim() || undefined;

      const blocks = Array.isArray(section?.blocks)
        ? section.blocks.filter(Boolean)
        : [];

      const items = Array.isArray(section?.items)
        ? section.items.filter(
            (item) =>
              item &&
              String(item.title || "").trim() &&
              String(item.description || "").trim()
          )
        : [];

      const cardGroups = Array.isArray(section?.cardGroups)
        ? section.cardGroups
            .map((group, groupIndex) => {
              const groupId = String(group?.id || `group-${groupIndex + 1}`).trim();
              const groupTitle = String(group?.title ?? "").trim() || undefined;
              const groupDescription =
                String(group?.description ?? "").trim() || undefined;

              const groupItems = Array.isArray(group?.items)
                ? group.items.filter(
                    (item) =>
                      item &&
                      String(item.title || "").trim() &&
                      String(item.description || "").trim()
                  )
                : [];

              if (!groupId || !groupItems.length) return null;

              return {
                ...group,
                id: groupId,
                ...(groupTitle ? { title: groupTitle } : {}),
                ...(groupDescription ? { description: groupDescription } : {}),
                items: groupItems,
              };
            })
            .filter((group): group is CategoryCardGroup => Boolean(group))
        : [];

      const hasContent =
        blocks.length > 0 || items.length > 0 || cardGroups.length > 0;

      if (!id || !title || !hasContent) return null;

      return {
        ...section,
        id,
        ...(key ? { key } : {}),
        title,
        ...(intro ? { intro } : {}),
        blocks,
        ...(items.length ? { items } : {}),
        ...(cardGroups.length ? { cardGroups } : {}),
      };
    })
    .filter((section): section is SafeSection => Boolean(section))
);

const tabItems = computed<TabItem[]>(() =>
  safeSections.value.map((section) => ({
    id: section.id,
    label: section.title,
  }))
);

const tabLeadById = computed<Record<string, string>>(() =>
  safeSections.value.reduce((acc, section) => {
    const intro = String(section.intro ?? "").trim();
    if (intro) acc[section.id] = intro;
    return acc;
  }, {} as Record<string, string>)
);

watch(
  () => safeSections.value.map((section) => section.id),
  (ids) => {
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

const activeSection = computed<SafeSection | null>(() => {
  if (!safeSections.value.length) return null;

  return (
    safeSections.value.find((section) => section.id === activeTabId.value) ||
    safeSections.value[0] ||
    null
  );
});

const activeLead = computed(() => {
  if (!activeSection.value) return "";
  return tabLeadById.value[activeSection.value.id] ?? "";
});
</script>

<template>
  <div v-if="safeSections.length" class="w-full space-y-6 md:space-y-8">
    <ContentTabs
      v-model="activeTabId"
      :items="tabItems"
      aria-label="Información detallada"
      :keep-mounted="true"
      section-class="space-y-4 md:space-y-5"
      panel-class="min-w-0 pt-2"
    />

    <div
      v-if="activeSection"
      class="space-y-6 md:space-y-8"
    >
      <p
        v-if="activeLead"
        class="max-w-3xl text-base leading-8 text-muted-foreground"
      >
        {{ activeLead }}
      </p>

      <ContentSectionsPanel
        :section="activeSection"
        :details-media="detailsMedia"
        :featured-product="featuredProduct"
        header-mode="none"
      />
    </div>
  </div>
</template>~/server/services/cms/_catalog.service