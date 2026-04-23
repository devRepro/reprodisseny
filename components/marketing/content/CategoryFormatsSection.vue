<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";

type ContentFormatItem = {
  title: string;
  description: string;
};

type ContentFormatsData = {
  intro?: string;
  shapes: ContentFormatItem[];
  deliveryFormats: ContentFormatItem[];
};

const props = withDefaults(
  defineProps<{
    title?: string;
    data: ContentFormatsData;
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
    sectionId: "",
    eyebrow: "Información sobre formatos",
    class: "",
    headerClass: "",
    gridClass: "",
    cardClass: "",
    showHeader: true,
  }
);

const shapes = computed(() =>
  Array.isArray(props.data?.shapes)
    ? props.data.shapes.filter(
        (item) =>
          item &&
          String(item.title || "").trim() &&
          String(item.description || "").trim()
      )
    : []
);

const deliveryFormats = computed(() =>
  Array.isArray(props.data?.deliveryFormats)
    ? props.data.deliveryFormats.filter(
        (item) =>
          item &&
          String(item.title || "").trim() &&
          String(item.description || "").trim()
      )
    : []
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
const gridBaseClass = "grid auto-rows-fr gap-6";
const cardBaseClass =
  "h-full rounded-[24px] border border-border/60 bg-card p-6 shadow-sm";

const embeddedDividerStyle = {
  background:
    "linear-gradient(90deg, hsl(var(--primary) / 0) 0%, hsl(var(--primary) / 0.20) 18%, hsl(var(--primary) / 0.10) 56%, hsl(var(--border)) 100%)",
};
</script>

<template>
  <section
    v-if="hasContent"
    :id="sectionId"
    :class="cn(sectionStackClass, props.class)"
  >
    <ContentSectionHeader
      v-if="showHeader && title"
      :title="title"
      :subtitle="data.intro || ''"
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
            <h3 class="section-title section-title--compact">
              {{ sectionTitleFor("shapes") }}
            </h3>
            <p class="mb-0 max-w-3xl text-body text-muted-foreground">
              {{ sectionSubtitleFor("shapes") }}
            </p>
          </div>

          <div
            class="h-px w-full max-w-[560px]"
            :style="embeddedDividerStyle"
            aria-hidden="true"
          />
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
            v-for="item in shapes"
            :key="`shape-${item.title}`"
            :class="cn(cardBaseClass, props.cardClass)"
          >
            <div class="space-y-2.5">
              <h4 class="section-title section-title--compact">
                {{ item.title }}
              </h4>
              <p class="mb-0 text-body text-muted-foreground">
                {{ item.description }}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section v-if="hasDeliveryFormats" :class="subsectionStackClass">
        <div class="space-y-3">
          <div class="space-y-1.5">
            <h3 class="section-title section-title--compact">
              {{ sectionTitleFor("delivery") }}
            </h3>
            <p class="mb-0 max-w-3xl text-body text-muted-foreground">
              {{ sectionSubtitleFor("delivery") }}
            </p>
          </div>

          <div
            class="h-px w-full max-w-[560px]"
            :style="embeddedDividerStyle"
            aria-hidden="true"
          />
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
            v-for="item in deliveryFormats"
            :key="`delivery-${item.title}`"
            :class="cn(cardBaseClass, props.cardClass)"
          >
            <div class="space-y-2.5">
              <h4 class="section-title section-title--compact">
                {{ item.title }}
              </h4>
              <p class="mb-0 text-body text-muted-foreground">
                {{ item.description }}
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>