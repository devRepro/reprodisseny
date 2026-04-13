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
    title: string;
    data: ContentFormatsData;
    sectionId?: string;
    eyebrow?: string;
    class?: string;
    headerClass?: string;
    gridClass?: string;
    cardClass?: string;
  }>(),
  {
    sectionId: "",
    eyebrow: "Información sobre formatos",
    class: "",
    headerClass: "",
    gridClass: "",
    cardClass: "",
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
</script>

<template>
  <section
    v-if="hasContent"
    :id="sectionId"
    :class="cn('space-y-8 md:space-y-10', props.class)"
  >
    <ContentSectionHeader
      :title="title"
      :subtitle="data.intro || ''"
      :eyebrow="eyebrow"
      as="h3"
      tone="foreground"
      :divider="true"
      :class="cn('max-w-3xl', props.headerClass)"
    />

    <div class="space-y-8 md:space-y-10">
      <section v-if="hasShapes" class="space-y-4 md:space-y-5">
        <div class="space-y-1">
          <h4 class="font-h4 text-foreground">
            {{ sectionTitleFor("shapes") }}
          </h4>
          <p class="font-body-s text-muted-foreground">
            Opciones de forma y corte según el tipo de pieza y el uso previsto.
          </p>
        </div>

        <div
          :class="
            cn(
              'grid gap-4 md:grid-cols-2 xl:grid-cols-3',
              props.gridClass
            )
          "
        >
          <article
            v-for="item in shapes"
            :key="`shape-${item.title}`"
            :class="
              cn(
                'h-full rounded-3xl border border-border/60 bg-card p-5 shadow-sm md:p-6',
                props.cardClass
              )
            "
          >
            <div class="space-y-2">
              <h5 class="font-h4 text-foreground">
                {{ item.title }}
              </h5>
              <p class="font-body text-sm leading-6 text-muted-foreground">
                {{ item.description }}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section v-if="hasDeliveryFormats" class="space-y-4 md:space-y-5">
        <div class="space-y-1">
          <h4 class="font-h4 text-foreground">
            {{ sectionTitleFor("delivery") }}
          </h4>
          <p class="font-body-s text-muted-foreground">
            Formatos habituales de presentación, suministro o entrega del material.
          </p>
        </div>

        <div
          :class="
            cn(
              'grid gap-4 md:grid-cols-2',
              props.gridClass
            )
          "
        >
          <article
            v-for="item in deliveryFormats"
            :key="`delivery-${item.title}`"
            :class="
              cn(
                'h-full rounded-3xl border border-border/60 bg-card p-5 shadow-sm md:p-6',
                props.cardClass
              )
            "
          >
            <div class="space-y-2">
              <h5 class="font-h4 text-foreground">
                {{ item.title }}
              </h5>
              <p class="font-body text-sm leading-6 text-muted-foreground">
                {{ item.description }}
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>