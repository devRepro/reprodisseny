<script setup lang="ts">
import { computed } from "vue";
import AppChip from "@/components/shared/pills/AppChip.vue";
import CategoryShowcaseCta from "@/components/marketing/category/CategoryShowcaseCta.vue";
import ContentDetailsSection from "@/components/marketing/content/ContentDetailsSection.vue";

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

type SafeSection = {
  id: string;
  key?: string;
  title: string;
  intro?: string;
  blocks: ContentBlock[];
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
    section: SafeSection;
    detailsMedia?: DetailsMediaItem | null;
    featuredProduct?: Record<string, unknown> | null;
  }>(),
  {
    detailsMedia: null,
    featuredProduct: null,
  }
);

const leadImage = computed(() => {
  const image = props.detailsMedia?.image;
  return image?.src ? image : null;
});

const pills = computed(() =>
  (props.detailsMedia?.pills || []).filter(
    (item) => String(item?.label || "").trim() && String(item?.to || "").trim()
  )
);

const hasDetailsMedia = computed(() => {
  return Boolean(leadImage.value || pills.value.length);
});
</script>

<template>
  <div class="space-y-8 md:space-y-10">
    <section
      v-if="hasDetailsMedia"
      class="container-content space-y-4 md:space-y-5"
      aria-label="Imagen y enlaces relacionados"
    >
      <figure
        v-if="leadImage"
        class="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)]"
      >
        <div class="aspect-[16/9] bg-muted/20">
          <img
            :src="leadImage.src"
            :alt="leadImage.alt || section.title"
            class="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        <figcaption
          v-if="leadImage.caption"
          class="px-4 py-3 text-body-s text-foreground/68"
        >
          {{ leadImage.caption }}
        </figcaption>
      </figure>

      <div v-if="pills.length" class="flex flex-wrap gap-2">
        <AppChip
          v-for="pill in pills"
          :key="`${pill.to}-${pill.label}`"
          :to="pill.to"
        >
          {{ pill.label }}
        </AppChip>
      </div>
    </section>

    <ContentDetailsSection
      :section="section"
      eyebrow="Información de la categoría"
      class="container-content"
      :show-header="!hasDetailsMedia"
    />

    <CategoryShowcaseCta
      v-if="featuredProduct"
      class="container-content"
      :product="featuredProduct"
      :highlights="[
        'Ideal para packaging, retail y promociones.',
        'Disponible en distintos materiales y acabados.',
        'Solicita presupuesto desde la ficha del producto.',
      ]"
    />
  </div>
</template>