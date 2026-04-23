<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";

type CategoryTypeItem = {
  title: string;
  description: string;
  features?: string[];
  idealFor?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    intro?: string;
    items?: CategoryTypeItem[];
    sectionId?: string;
    eyebrow?: string;
    class?: string;
    headerClass?: string;
    gridClass?: string;
    cardClass?: string;
    showHeader?: boolean;
  }>(),
  {
    title: "Tipos",
    intro: "",
    items: () => [],
    sectionId: "",
    eyebrow: "Información sobre los diferentes tipos",
    class: "",
    headerClass: "",
    gridClass: "",
    cardClass: "",
    showHeader: true,
  }
);

const safeItems = computed(() =>
  Array.isArray(props.items)
    ? props.items.filter(
        (item) =>
          item &&
          String(item.title || "").trim() &&
          String(item.description || "").trim()
      )
    : []
);

const sectionStackClass = "space-y-8 md:space-y-10";
const gridBaseClass = "grid auto-rows-fr gap-4 md:gap-5";
const cardBaseClass =
  "h-full rounded-[24px] border border-border/70 bg-muted/55 p-5 md:p-6";
const featureChipClass =
  "inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary";
const idealForBoxClass =
  "mt-5 rounded-[18px] border border-border/60 bg-background/70 p-4";
</script>

<template>
  <section
    v-if="safeItems.length"
    :id="sectionId"
    :class="cn(sectionStackClass, props.class)"
  >
    <ContentSectionHeader
      v-if="showHeader && title"
      :title="title"
      :subtitle="intro || ''"
      :eyebrow="eyebrow"
      as="h3"
      tone="foreground"
      :divider="true"
      :class="cn('max-w-3xl', props.headerClass)"
    />

    <div
      :class="
        cn(
          gridBaseClass,
          'md:grid-cols-2 xl:grid-cols-3',
          props.gridClass
        )
      "
    >
      <article
        v-for="item in safeItems"
        :key="item.title"
        :class="cn(cardBaseClass, props.cardClass)"
      >
        <div class="flex h-full flex-col">
          <div class="space-y-2.5">
            <h3 class="section-title section-title--compact">
              {{ item.title }}
            </h3>

            <p class="mb-0 text-body text-muted-foreground">
              {{ item.description }}
            </p>
          </div>

          <div
            v-if="item.features?.length"
            class="mt-5 flex flex-wrap gap-2"
          >
            <span
              v-for="feature in item.features"
              :key="feature"
              :class="featureChipClass"
            >
              {{ feature }}
            </span>
          </div>

          <div
            v-if="item.idealFor"
            :class="idealForBoxClass"
          >
            <span class="mb-1 block text-body-s font-semibold text-foreground">
              Ideal para:
            </span>
            <p class="mb-0 text-body text-muted-foreground">
              {{ item.idealFor }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>