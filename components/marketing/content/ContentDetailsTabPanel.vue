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
</script>

<template>
  <div class="space-y-8 md:space-y-10">
    <section class="container-content" :aria-label="section.title">
      <div
        class="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start lg:gap-10"
      >
        <div class="min-w-0 max-w-[680px] space-y-6 md:space-y-8">
          <ContentDetailsSection
            :section="section"
            eyebrow="Información de la categoría"
            :show-header="false"
            content-class="space-y-5 md:space-y-6"
          />

          <div v-if="pills.length" class="space-y-3 pt-2">
            <p class="text-label text-foreground/60">
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
          class="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)]"
        >
          <div class="aspect-[4/3] bg-muted/20">
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
      </div>
    </section>

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