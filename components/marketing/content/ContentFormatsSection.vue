<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";

type ContentFormatItem = {
  title?: string;
  description?: string;
  features?: string[];
  tags?: string[];
  idealFor?: string;
  meta?: string;
};

type ContentFormatsData = {
  intro?: string;
  shapes?: ContentFormatItem[];
  deliveryFormats?: ContentFormatItem[];
};

type SafeFormatItem = {
  id: string;
  title: string;
  description: string;
  features: string[];
  idealFor?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    data?: ContentFormatsData | null;
    sectionId?: string;
    eyebrow?: string;
    class?: string;
    headerClass?: string;
    gridClass?: string;
    cardClass?: string;
    showHeader?: boolean;
  }>(),
  {
    title: "",
    data: null,
    sectionId: "",
    eyebrow: "Información sobre formatos",
    class: "",
    headerClass: "",
    gridClass: "",
    cardClass: "",
    showHeader: true,
  }
);

function slugify(value: string, fallback = "formato") {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function normalizeItems(
  items: ContentFormatItem[] | undefined,
  prefix: "shape" | "delivery"
): SafeFormatItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item, index) => {
      const title = String(item?.title || "").trim();
      const description = String(item?.description || "").trim();

      if (!title || !description) return null;

      const rawFeatures = Array.isArray(item.features)
        ? item.features
        : Array.isArray(item.tags)
          ? item.tags
          : [];

      const features = rawFeatures
        .map((feature) => String(feature || "").trim())
        .filter(Boolean);

      const idealFor = String(item.idealFor || item.meta || "").trim();

      return {
        id: `${prefix}-${slugify(title, "item")}-${index + 1}`,
        title,
        description,
        features,
        ...(idealFor ? { idealFor } : {}),
      };
    })
    .filter((item): item is SafeFormatItem => Boolean(item));
}

const introText = computed(() => String(props.data?.intro || "").trim());

const shapes = computed(() => normalizeItems(props.data?.shapes, "shape"));

const deliveryFormats = computed(() =>
  normalizeItems(props.data?.deliveryFormats, "delivery")
);

const hasShapes = computed(() => shapes.value.length > 0);
const hasDeliveryFormats = computed(() => deliveryFormats.value.length > 0);
const hasContent = computed(() => hasShapes.value || hasDeliveryFormats.value);

function sectionTitleFor(kind: "shapes" | "delivery") {
  return kind === "shapes" ? "Formas disponibles" : "Formatos y presentación";
}

function sectionSubtitleFor(kind: "shapes" | "delivery") {
  return kind === "shapes"
    ? "Opciones de forma y corte según el tipo de pieza y el uso previsto."
    : "Formatos habituales de presentación, suministro o entrega del material.";
}

function eyebrowFor(kind: "shapes" | "delivery", index: number) {
  const label = kind === "shapes" ? "Formato" : "Presentación";
  return `${label} ${String(index + 1).padStart(2, "0")}`;
}

function getGridClass(count: number, allowThreeCols = false) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "md:grid-cols-2";
  if (count === 3 && allowThreeCols) return "md:grid-cols-2 xl:grid-cols-3";
  if (count === 4) return "md:grid-cols-2";
  return allowThreeCols ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2";
}

const shapesGridClass = computed(() => getGridClass(shapes.value.length, true));

const deliveryGridClass = computed(() =>
  getGridClass(deliveryFormats.value.length, false)
);

const sectionStackClass = "space-y-8 md:space-y-10";
const subsectionStackClass = "space-y-5 md:space-y-6";
const gridBaseClass = "grid auto-rows-fr gap-4 md:gap-5";

const subsectionTitleClass =
  "mb-0 text-xl font-semibold leading-tight tracking-[-0.02em] text-foreground";

const subsectionSubtitleClass =
  "mb-0 max-w-3xl text-body leading-relaxed text-muted-foreground";

const dividerClass =
  "h-px w-full max-w-[560px] bg-gradient-to-r from-foreground/18 via-border to-transparent";

const cardBaseClass =
  "group/card relative h-full overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md md:p-6";

const cardAccentClass =
  "absolute inset-y-6 left-0 w-1 rounded-r-full bg-foreground/15 transition-colors duration-200 group-hover/card:bg-primary/55";

const cardEyebrowClass =
  "mb-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground";

const cardTitleClass =
  "mb-0 text-lg font-semibold leading-tight tracking-tight text-foreground";

const cardDescriptionClass =
  "mb-0 text-body leading-[1.7] text-muted-foreground";

const featureChipClass =
  "inline-flex items-center rounded-full border border-border/80 bg-secondary/60 px-3 py-1 text-body-s font-medium text-foreground/75 transition group-hover/card:border-foreground/20 group-hover/card:bg-secondary";

const idealForBoxClass =
  "mt-5 rounded-2xl border border-[hsl(var(--brand-bg-2))] bg-[hsl(var(--brand-bg-2)/0.62)] p-4";

const idealForLabelClass =
  "mb-1 block text-body-s font-semibold text-foreground";

const idealForTextClass =
  "mb-0 text-body-s leading-[1.6] text-muted-foreground";
</script>

<template>
  <section
    v-if="hasContent"
    :id="sectionId || undefined"
    :class="cn(sectionStackClass, props.class)"
  >
    <ContentSectionHeader
      v-if="showHeader && title"
      :title="title"
      :subtitle="introText"
      :eyebrow="eyebrow"
      as="h3"
      tone="foreground"
      :divider="true"
      :class="cn('max-w-3xl', props.headerClass)"
    />

    <div :class="sectionStackClass">
      <section v-if="hasShapes" :class="subsectionStackClass">
        <div class="space-y-3">
          <div class="space-y-1.5">
            <h3 :class="subsectionTitleClass">
              {{ sectionTitleFor("shapes") }}
            </h3>

            <p :class="subsectionSubtitleClass">
              {{ sectionSubtitleFor("shapes") }}
            </p>
          </div>

          <div :class="dividerClass" aria-hidden="true" />
        </div>

        <div
          :class="
            cn(
              gridBaseClass,
              shapesGridClass,
              props.gridClass
            )
          "
        >
          <article
            v-for="(item, index) in shapes"
            :key="item.id"
            :class="cn(cardBaseClass, props.cardClass)"
          >
            <span :class="cardAccentClass" aria-hidden="true" />

            <div class="flex h-full flex-col pl-2">
              <div class="space-y-3">
                <p :class="cardEyebrowClass">
                  {{ eyebrowFor("shapes", index) }}
                </p>

                <h4 :class="cardTitleClass">
                  {{ item.title }}
                </h4>

                <p :class="cardDescriptionClass">
                  {{ item.description }}
                </p>
              </div>

              <div v-if="item.features.length" class="mt-5 flex flex-wrap gap-2">
                <span
                  v-for="feature in item.features"
                  :key="`${item.id}-${feature}`"
                  :class="featureChipClass"
                >
                  {{ feature }}
                </span>
              </div>

              <div v-if="item.idealFor" :class="idealForBoxClass">
                <span :class="idealForLabelClass">
                  Ideal para
                </span>

                <p :class="idealForTextClass">
                  {{ item.idealFor }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section v-if="hasDeliveryFormats" :class="subsectionStackClass">
        <div class="space-y-3">
          <div class="space-y-1.5">
            <h3 :class="subsectionTitleClass">
              {{ sectionTitleFor("delivery") }}
            </h3>

            <p :class="subsectionSubtitleClass">
              {{ sectionSubtitleFor("delivery") }}
            </p>
          </div>

          <div :class="dividerClass" aria-hidden="true" />
        </div>

        <div
          :class="
            cn(
              gridBaseClass,
              deliveryGridClass,
              props.gridClass
            )
          "
        >
          <article
            v-for="(item, index) in deliveryFormats"
            :key="item.id"
            :class="cn(cardBaseClass, props.cardClass)"
          >
            <span :class="cardAccentClass" aria-hidden="true" />

            <div class="flex h-full flex-col pl-2">
              <div class="space-y-3">
                <p :class="cardEyebrowClass">
                  {{ eyebrowFor("delivery", index) }}
                </p>

                <h4 :class="cardTitleClass">
                  {{ item.title }}
                </h4>

                <p :class="cardDescriptionClass">
                  {{ item.description }}
                </p>
              </div>

              <div v-if="item.features.length" class="mt-5 flex flex-wrap gap-2">
                <span
                  v-for="feature in item.features"
                  :key="`${item.id}-${feature}`"
                  :class="featureChipClass"
                >
                  {{ feature }}
                </span>
              </div>

              <div v-if="item.idealFor" :class="idealForBoxClass">
                <span :class="idealForLabelClass">
                  Ideal para
                </span>

                <p :class="idealForTextClass">
                  {{ item.idealFor }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>