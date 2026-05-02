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

type SafeTypeItem = {
  id: string;
  title: string;
  description: string;
  features: string[];
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

function slugify(value: string, fallback = "tipo") {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

const safeItems = computed<SafeTypeItem[]>(() =>
  Array.isArray(props.items)
    ? props.items
        .map((item, index) => {
          const title = String(item?.title || "").trim();
          const description = String(item?.description || "").trim();
          const idealFor = String(item?.idealFor || "").trim() || undefined;

          const features = Array.isArray(item?.features)
            ? item.features.map((feature) => String(feature || "").trim()).filter(Boolean)
            : [];

          if (!title || !description) return null;

          return {
            id: `${slugify(title, "tipo")}-${index + 1}`,
            title,
            description,
            features,
            ...(idealFor ? { idealFor } : {}),
          };
        })
        .filter((item): item is SafeTypeItem => Boolean(item))
    : []
);

const sectionStackClass = "space-y-8 md:space-y-10";

const gridBaseClass = "grid auto-rows-fr gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3";

const cardBaseClass =
  "group/card flex h-full flex-col rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md md:p-6";

const titleClass =
  "mb-0 text-lg font-semibold leading-tight tracking-tight text-foreground";

const descriptionClass = "mb-0 text-body leading-[1.7] text-muted-foreground";

const featureChipClass =
  "inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-body-s font-medium text-primary";

const idealForBoxClass = "mt-5 rounded-2xl border border-primary/10 bg-accent/35 p-4";

const idealForLabelClass = "mb-1 block text-body-s font-semibold text-foreground";

const idealForTextClass = "mb-0 text-body-s leading-[1.6] text-muted-foreground";
</script>

<template>
  <section
    v-if="safeItems.length"
    :id="sectionId || undefined"
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

    <div :class="cn(gridBaseClass, props.gridClass)">
      <article
        v-for="item in safeItems"
        :key="item.id"
        :class="cn(cardBaseClass, props.cardClass)"
      >
        <div class="flex h-full flex-col">
          <div class="space-y-2.5">
            <h3 :class="titleClass">
              {{ item.title }}
            </h3>

            <p :class="descriptionClass">
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
            <span :class="idealForLabelClass"> Ideal para </span>

            <p :class="idealForTextClass">
              {{ item.idealFor }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
