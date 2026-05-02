<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";
import type { CategoryCardGroup } from "~/server/services/cms/catalog.service";

type NormalizedCardItem = {
  id: string;
  title: string;
  description: string;
  meta?: string;
  tags?: string[];
};

type NormalizedCardGroup = {
  id: string;
  title?: string;
  description?: string;
  columns: 2 | 3 | 4;
  items: NormalizedCardItem[];
};

const props = withDefaults(
  defineProps<{
    sectionId?: string;
    title?: string;
    intro?: string;
    eyebrow?: string;
    groups?: CategoryCardGroup[];
    showHeader?: boolean;
    variant?: "default" | "feature";
    class?: string;
    headerClass?: string;
    groupClass?: string;
    gridClass?: string;
    cardClass?: string;
  }>(),
  {
    sectionId: "",
    title: "",
    intro: "",
    eyebrow: "",
    groups: () => [],
    showHeader: true,
    variant: "default",
    class: "",
    headerClass: "",
    groupClass: "",
    gridClass: "",
    cardClass: "",
  }
);

function slugify(value: string, fallback = "item") {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function normalizeColumns(value: unknown): 2 | 3 | 4 {
  if (value === 4) return 4;
  if (value === 3) return 3;
  return 2;
}

const normalizedGroups = computed<NormalizedCardGroup[]>(() =>
  (props.groups || [])
    .map((group, groupIndex) => {
      const id = String(group?.id || `group-${groupIndex + 1}`).trim();
      const title = String(group?.title || "").trim() || undefined;
      const description = String(group?.description || "").trim() || undefined;
      const columns = normalizeColumns(group?.columns ?? 2);

      const items = Array.isArray(group?.items)
        ? group.items
            .map((item, itemIndex) => {
              const record = item as {
                id?: string;
                title?: string;
                description?: string;
                text?: string;
                meta?: string;
                tags?: unknown[];
              };

              const itemTitle = String(record?.title || "").trim();
              const itemDescription = String(
                record?.description || record?.text || ""
              ).trim();
              const itemMeta = String(record?.meta || "").trim() || undefined;
              const itemTags = Array.isArray(record?.tags)
                ? record.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
                : [];

              if (!itemTitle && !itemDescription) return null;

              return {
                id:
                  String(record?.id || "").trim() ||
                  `${slugify(itemTitle || itemDescription, "item")}-${itemIndex + 1}`,
                title: itemTitle,
                description: itemDescription,
                ...(itemMeta ? { meta: itemMeta } : {}),
                ...(itemTags.length ? { tags: itemTags } : {}),
              };
            })
            .filter((item): item is NormalizedCardItem => Boolean(item))
        : [];

      if (!id || !items.length) return null;

      return {
        id,
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        columns,
        items,
      };
    })
    .filter((group): group is NormalizedCardGroup => Boolean(group))
);

const hasContent = computed(() => normalizedGroups.value.length > 0);

function gridClassFor(columns: 2 | 3 | 4, count: number) {
  if (count <= 1) return "grid-cols-1";

  if (columns === 4) return "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";
  if (columns === 3) return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  return "grid-cols-1 md:grid-cols-2";
}

function hasGroupHeading(group: NormalizedCardGroup) {
  return Boolean(group.title || group.description);
}

const sectionClass = computed(() => cn("space-y-8 md:space-y-10", props.class));

const groupWrapperClass = computed(() => cn("space-y-5 md:space-y-6", props.groupClass));

const gridBaseClass = computed(() =>
  cn("grid auto-rows-fr gap-4 md:gap-5", props.gridClass)
);

const cardBaseClass = computed(() =>
  cn(
    "flex h-full flex-col rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200",
    "hover:-translate-y-1 hover:border-primary/20 hover:shadow-md",
    "focus-within:border-primary/20 focus-within:shadow-md",
    props.variant === "feature" &&
      "bg-[hsl(var(--brand-base-light)/0.16)] border-primary/10",
    props.cardClass
  )
);

const metaClass = computed(() =>
  cn(
    "inline-flex w-fit items-center rounded-full px-3 py-1",
    "text-[11px] font-semibold uppercase tracking-[0.14em]",
    props.variant === "feature"
      ? "border border-primary/15 bg-primary/5 text-primary"
      : "border border-border bg-muted/40 text-muted-foreground"
  )
);

const titleClass = "mb-0 text-lg font-semibold leading-tight text-foreground";

const descriptionClass = "mb-0 text-body leading-[1.75] text-muted-foreground";

const groupTitleClass =
  "mb-0 text-lg font-semibold tracking-tight text-foreground md:text-xl";

const groupDescriptionClass =
  "mb-0 max-w-3xl text-body leading-[1.7] text-muted-foreground";

const groupDividerClass =
  "h-px w-full max-w-[560px] bg-gradient-to-r from-border via-border/70 to-transparent";
</script>

<template>
  <section v-if="hasContent" :id="sectionId || undefined" :class="sectionClass">
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

    <div class="space-y-8 md:space-y-10">
      <section
        v-for="group in normalizedGroups"
        :key="group.id"
        :class="groupWrapperClass"
      >
        <div v-if="hasGroupHeading(group)" class="space-y-3">
          <div class="space-y-1.5">
            <h4 v-if="group.title" :class="groupTitleClass">
              {{ group.title }}
            </h4>

            <p v-if="group.description" :class="groupDescriptionClass">
              {{ group.description }}
            </p>
          </div>

          <div :class="groupDividerClass" aria-hidden="true" />
        </div>

        <div :class="cn(gridBaseClass, gridClassFor(group.columns, group.items.length))">
          <article
            v-for="(item, index) in group.items"
            :key="`${group.id}-${item.id}`"
            :class="cardBaseClass"
          >
            <div class="flex h-full flex-col gap-3">
              <p v-if="item.meta || variant === 'feature'" :class="metaClass">
                {{ item.meta || `Opción ${String(index + 1).padStart(2, "0")}` }}
              </p>

              <div class="space-y-2">
                <h5 v-if="item.title" :class="titleClass">
                  {{ item.title }}
                </h5>

                <p v-if="item.description" :class="descriptionClass">
                  {{ item.description }}
                </p>
              </div>

              <div v-if="item.tags?.length" class="mt-auto flex flex-wrap gap-2 pt-2">
                <span
                  v-for="tag in item.tags"
                  :key="`${item.id}-${tag}`"
                  class="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-body-s text-primary"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>
