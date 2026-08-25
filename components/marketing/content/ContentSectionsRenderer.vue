<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  ContentSectionKey,
  DetailsMediaItem,
  SectionViewModel,
} from "~/types/contentSections";
import ContentTabs from "./ContentTabs.vue";
import ContentSectionsPanel from "./ContentSectionsPanel.vue";

const TAB_LABELS: Record<ContentSectionKey, string> = {
  details: "Detalles",
  benefits: "Beneficios",
  types: "Tipos",
  formats: "Formatos",
  materials: "Materiales",
  finishes: "Acabados",
  applications: "Aplicaciones",
  "technical-specs": "Características técnicas",
};

const props = withDefaults(
  defineProps<{
    sections?: SectionViewModel[];
    variant?: "product" | "category";
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

const safeSections = computed(() =>
  props.sections.filter(
    (section) =>
      section.id === section.key &&
      section.id === section.kind &&
      Boolean(section.title) &&
      Boolean(
        section.html ||
          section.groups.length ||
          section.technicalHighlights.length
      )
  )
);

const tabItems = computed(() =>
  safeSections.value.map((section) => ({
    id: section.id,
    label: TAB_LABELS[section.id],
  }))
);

const sectionsById = computed(() =>
  Object.fromEntries(safeSections.value.map((section) => [section.id, section])) as Record<
    string,
    SectionViewModel
  >
);

const activeTabId = ref<string>(safeSections.value[0]?.id || "");

watch(
  () => safeSections.value.map((section) => section.id).join("|"),
  () => {
    const ids = safeSections.value.map((section) => section.id);
    if (!ids.length) activeTabId.value = "";
    else if (!ids.includes(activeTabId.value as ContentSectionKey)) {
      activeTabId.value = ids[0] || "";
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
        :details-media="item.id === 'details' ? detailsMedia : null"
        :featured-product="featuredProduct"
      />
    </template>
  </ContentTabs>
</template>
