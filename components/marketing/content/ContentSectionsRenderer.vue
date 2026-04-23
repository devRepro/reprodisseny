<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { CategoryDetailSectionItem } from "~/server/services/cms/catalog.service";
import AppChip from "@/components/shared/pills/AppChip.vue";
import ContentSectionsPanel from "@/components/marketing/content/ContentSectionsPanel.vue";

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

const safeSections = computed(() =>
  (props.sections ?? []).filter(
    (section) =>
      String(section?.id || "").trim() &&
      String(section?.title || "").trim()
  )
);

const activeTabId = ref("");

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
</script>

<template>
  <div v-if="safeSections.length" class="space-y-6 md:space-y-8">
    <div
      class="overflow-x-auto pb-1"
      role="tablist"
      aria-label="Información detallada"
    >
      <div class="flex min-w-max gap-2 md:gap-3">
        <AppChip
  v-for="section in safeSections"
  :id="`tab-${section.id}`"
  :key="section.id"
  variant="tab"
  :active="activeTabId === section.id"
  role="tab"
  :aria-selected="activeTabId === section.id ? 'true' : 'false'"
  :aria-controls="`panel-${section.id}`"
  @click="activeTabId = section.id"
>
  {{ section.title }}
</AppChip>
      </div>
    </div>

    <div class="relative">
      <section
        v-for="section in safeSections"
        :id="`panel-${section.id}`"
        :key="section.id"
        role="tabpanel"
        :aria-labelledby="`tab-${section.id}`"
        v-show="activeTabId === section.id"
        class="min-w-0"
      >
        <ContentSectionsPanel
          :section="section"
          :details-media="detailsMedia"
          :featured-product="featuredProduct"
          header-mode="none"
        />
      </section>
    </div>
  </div>
</template>