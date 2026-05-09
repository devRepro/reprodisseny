<!-- components/marketing/content/ContentDetailsTabPanel.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import { normalizeCmsMediaSrc } from "@/utils/cmsMedia";
import CmsImage from "@/components/shared/blocks/CmsImage.vue";
import AppChip from "@/components/shared/pills/AppChip.vue";
import CategoryShowcaseCta from "@/components/marketing/category/CategoryShowcaseCta.vue";
import ContentDetailsSection from "@/components/marketing/content/ContentDetailsSection.vue";

type DetailsSection = {
  id?: string;
  key?: string;
  title?: string;
  intro?: string;
  body?: string;
  text?: string;
  html?: string;
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

const props = withDefaults(
  defineProps<{
    section: DetailsSection;
    detailsMedia?: DetailsMediaItem | null;
    featuredProduct?: Record<string, unknown> | null;
    headerMode?: "default" | "intro-only" | "none";
    class?: string;
  }>(),
  {
    detailsMedia: null,
    featuredProduct: null,
    headerMode: "default",
    class: "",
  }
);

const leadImage = computed(() => {
  const image = props.detailsMedia?.image;
  const src = normalizeCmsMediaSrc(image?.src || "");

  if (!src) return null;

  return {
    src,
    alt: image?.alt || props.section?.title || "",
    caption: image?.caption || "",
  };
});

const pills = computed(() =>
  (props.detailsMedia?.pills || [])
    .map((item) => ({
      label: String(item?.label || "").trim(),
      to: String(item?.to || "").trim(),
    }))
    .filter((item) => item.label && item.to)
);

const hasLeadImage = computed(() => Boolean(leadImage.value));

const showDetailsHeader = computed(() => props.headerMode === "default");

const layoutClass = computed(() =>
  hasLeadImage.value
    ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:items-start lg:gap-10"
    : "max-w-[760px]"
);
</script>

<template>
  <div :class="cn('space-y-8 md:space-y-10', props.class)">
    <section :aria-label="section.title || 'Detalle'" class="w-full">
      <div :class="layoutClass">
        <div class="min-w-0 space-y-6 md:space-y-8">
          <ContentDetailsSection
            :section="section"
            eyebrow="Información"
            :show-header="showDetailsHeader"
            content-class="space-y-5 md:space-y-6"
          />

          <div v-if="pills.length" class="space-y-3 pt-1">
            <p class="mb-0 text-label text-muted-foreground">
              Productos o soluciones relacionadas
            </p>

            <div class="flex flex-wrap gap-2">
              <AppChip
                v-for="pill in pills"
                :key="`${pill.to}-${pill.label}`"
                variant="pill"
                :to="pill.to"
              >
                {{ pill.label }}
              </AppChip>
            </div>
          </div>
        </div>

        <figure
          v-if="leadImage"
          class="overflow-hidden rounded-3xl border border-border/60 bg-card p-3 shadow-sm"
        >
          <CmsImage
            :src="leadImage.src"
            :alt="leadImage.alt"
            width="840"
            height="630"
            class="aspect-[4/3] w-full rounded-[1.25rem] object-cover"
          />

          <figcaption
            v-if="leadImage.caption"
            class="px-2 pt-3 text-body-s leading-6 text-muted-foreground"
          >
            {{ leadImage.caption }}
          </figcaption>
        </figure>
      </div>
    </section>

    <CategoryShowcaseCta
      v-if="featuredProduct"
      :product="featuredProduct"
      :highlights="[
        'Ideal para packaging, retail y promociones.',
        'Disponible en distintos materiales y acabados.',
        'Solicita presupuesto desde la ficha del producto.',
      ]"
    />
  </div>
</template>
