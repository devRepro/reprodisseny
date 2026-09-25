<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import type {
  ContentSectionKey,
  DetailsMediaItem,
  SectionViewModel,
} from "~/types/contentSections";
import ContentTabs from "./ContentTabs.vue";
import ProductContentNav from "./ProductContentNav.vue";
import ContentSectionsPanel from "./ContentSectionsPanel.vue";

const SECTION_LABELS: Record<ContentSectionKey, string> = {
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

const hasDetailsMedia = computed(() =>
  Boolean(
    props.detailsMedia?.image?.src ||
      props.detailsMedia?.images?.some((image) => image?.src)
  )
);

const normalizedSections = computed(() =>
  props.sections.filter(
    (section) =>
      section.id === section.key &&
      section.id === section.kind &&
      Boolean(section.title)
  )
);

const safeSections = computed(() => {
  const sections = [...normalizedSections.value];

  if (
    props.variant === "product" &&
    hasDetailsMedia.value &&
    !sections.some((section) => section.id === "details")
  ) {
    sections.unshift({
      id: "details",
      key: "details",
      kind: "details",
      title: SECTION_LABELS.details,
      source: "unknown",
      sourceKey: "detailsMedia",
      contentFormat: "text",
      pattern: "editorial",
      groups: [],
      technicalHighlights: [],
    });
  }

  return sections.filter((section) =>
    Boolean(
      section.html ||
        section.groups.length ||
        section.technicalHighlights.length ||
        (props.variant === "product" && section.id === "details" && hasDetailsMedia.value)
    )
  );
});

const tabItems = computed(() =>
  safeSections.value.map((section) => ({
    id: section.id,
    label: SECTION_LABELS[section.id],
  }))
);

const productNavItems = computed(() =>
  safeSections.value.map((section) => ({
    id: sectionAnchorId(section.id),
    label: SECTION_LABELS[section.id],
  }))
);

const sectionsById = computed(() =>
  Object.fromEntries(safeSections.value.map((section) => [section.id, section])) as Record<
    string,
    SectionViewModel
  >
);

const activeTabId = ref<string>(safeSections.value[0]?.id || "");
const openMobileSectionIds = ref<string[]>([]);

watch(
  () => safeSections.value.map((section) => section.id).join("|"),
  () => {
    const ids = safeSections.value.map((section) => section.id);
    if (!ids.length) activeTabId.value = "";
    else if (!ids.includes(activeTabId.value as ContentSectionKey)) {
      activeTabId.value = ids[0] || "";
    }

    openMobileSectionIds.value = openMobileSectionIds.value.filter((id) =>
      ids.includes(id as ContentSectionKey)
    );
  },
  { immediate: true }
);

function sectionAnchorId(id: string) {
  return `product-content-${id}`;
}

function sectionPanelId(id: string) {
  return `product-content-panel-${id}`;
}

function isMobileSectionOpen(id: string) {
  return id === "details" || openMobileSectionIds.value.includes(id);
}

function toggleMobileSection(id: string) {
  if (id === "details") return;

  openMobileSectionIds.value = openMobileSectionIds.value.includes(id)
    ? openMobileSectionIds.value.filter((current) => current !== id)
    : [...openMobileSectionIds.value, id];
}
</script>

<template>
  <template v-if="safeSections.length">
    <div v-if="variant === 'product'" class="product-content-flow">
      <div class="product-content-flow__layout">
        <ProductContentNav :items="productNavItems" />

        <div class="product-content-flow__sections">
          <section
            v-for="section in safeSections"
            :id="sectionAnchorId(section.id)"
            :key="section.id"
            class="product-content-section scroll-mt-24 lg:scroll-mt-32"
            :aria-labelledby="`${sectionAnchorId(section.id)}-heading`"
          >
            <div class="product-content-section__header">
              <h3
                :id="`${sectionAnchorId(section.id)}-heading`"
                class="product-content-section__title"
              >
                <button
                  v-if="section.id !== 'details'"
                  type="button"
                  class="product-content-section__accordion-button"
                  :aria-expanded="isMobileSectionOpen(section.id)"
                  :aria-controls="sectionPanelId(section.id)"
                  @click="toggleMobileSection(section.id)"
                >
                  <span>{{ SECTION_LABELS[section.id] }}</span>
                  <ChevronDown
                    class="product-content-section__accordion-icon"
                    :class="isMobileSectionOpen(section.id) && 'rotate-180'"
                    aria-hidden="true"
                  />
                </button>

                <span
                  :class="section.id === 'details' ? 'block' : 'hidden lg:block'"
                >
                  {{ SECTION_LABELS[section.id] }}
                </span>
              </h3>

            </div>

            <div
              :id="sectionPanelId(section.id)"
              :class="cn('product-content-section__body', section.id === 'details' || isMobileSectionOpen(section.id) ? 'block' : 'hidden lg:block')"
            >
              <p v-if="section.intro" class="product-content-section__intro">
                {{ section.intro }}
              </p>

              <ContentSectionsPanel
                :section="section"
                :details-media="section.id === 'details' ? detailsMedia : null"
                :featured-product="featuredProduct"
                presentation="product"
                :show-intro="false"
              />
            </div>
          </section>
        </div>
      </div>
    </div>

    <ContentTabs
      v-else
      v-model="activeTabId"
      :items="tabItems"
      aria-label="Información detallada"
      :keep-mounted="true"
      :section-class="variant === 'category' ? 'category-details-card category-content-tabs' : 'space-y-0'"
      :scroller-class="variant === 'category' ? 'category-content-tabs__scroller' : ''"
      :list-class="variant === 'category' ? 'category-content-tabs__list' : ''"
      :tab-class="variant === 'category' ? 'category-content-tabs__tab' : ''"
      :active-tab-class="variant === 'category' ? 'category-content-tabs__tab--active' : ''"
      :inactive-tab-class="variant === 'category' ? 'category-content-tabs__tab--idle' : ''"
      :panel-class="variant === 'category' ? 'category-content-tabs__panel min-w-0' : 'min-w-0'"
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
</template>
