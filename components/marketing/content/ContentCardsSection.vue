<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";
import type { CategoryCardGroup } from "~/server/services/cms/catalog.service";

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

const normalizedGroups = computed(() =>
  (props.groups || [])
    .map((group, groupIndex) => {
      const id = String(group?.id || `group-${groupIndex + 1}`).trim();
      const title = String(group?.title || "").trim() || undefined;
      const description = String(group?.description || "").trim() || undefined;
      const columns = group?.columns ?? 2;

      const items = Array.isArray(group?.items)
        ? group.items
            .map((item, itemIndex) => {
              const itemTitle = String(item?.title || "").trim();
              const itemDescription = String(item?.description || "").trim();
              const itemMeta = String(item?.meta || "").trim() || undefined;
              const itemTags = Array.isArray(item?.tags)
                ? item.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
                : [];

              if (!itemTitle && !itemDescription) return null;

              return {
                id:
                  String((item as { id?: string })?.id || "").trim() ||
                  `${slugify(itemTitle || itemDescription, "item")}-${itemIndex + 1}`,
                title: itemTitle,
                description: itemDescription,
                ...(itemMeta ? { meta: itemMeta } : {}),
                ...(itemTags.length ? { tags: itemTags } : {}),
              };
            })
            .filter(Boolean)
        : [];

      if (!items.length) return null;

      return {
        id,
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        columns,
        items,
      };
    })
    .filter(Boolean)
);

const hasContent = computed(() => normalizedGroups.value.length > 0);

function gridClassFor(columns: 2 | 3 | 4, count: number) {
  if (count <= 1) return "grid-cols-1";

  switch (columns) {
    case 3:
      return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
    case 4:
      return "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";
    case 2:
    default:
      return "grid-cols-1 md:grid-cols-2";
  }
}

function hasGroupHeading(group: { title?: string; description?: string }) {
  return Boolean(group.title || group.description);
}

const cardBaseClass = computed(() =>
  props.variant === "feature"
    ? cn(
        "h-full rounded-[24px] border p-5 md:p-6",
        "border-border/50 bg-[hsl(var(--brand-base-light)/0.42)]",
        "shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.12)]"
      )
    : cn(
        "h-full rounded-[24px] border p-5 md:p-6",
        "border-border/50 bg-[hsl(var(--brand-base-light)/0.34)]"
      )
);

const titleClass = computed(() =>
  props.variant === "feature"
    ? "text-base font-semibold leading-[1.3] tracking-tight text-foreground md:text-[1.05rem]"
    : "text-base font-semibold leading-[1.3] tracking-tight text-foreground"
);

const descriptionClass =
  "text-body leading-[1.7] text-muted-foreground";

const groupTitleClass =
  "text-lg font-semibold tracking-tight text-foreground md:text-xl";

const groupDescriptionClass =
  "mb-0 max-w-3xl text-body text-muted-foreground";

const groupDividerClass =
  "h-px w-full max-w-[560px] bg-gradient-to-r from-primary/25 via-border/60 to-transparent";
</script>

<template>
  <section
    v-if="hasContent"
    :id="sectionId"
    :class="cn('space-y-8 md:space-y-10', props.class)"
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

    <div class="space-y-8 md:space-y-10">
      <section
        v-for="group in normalizedGroups"
        :key="group.id"
        :class="cn('space-y-5 md:space-y-6', props.groupClass)"
      >
        <div v-if="hasGroupHeading(group)" class="space-y-3">
          <div class="space-y-1.5">
            <h4
              v-if="group.title"
              :class="groupTitleClass"
            >
              {{ group.title }}
            </h4>

            <p
              v-if="group.description"
              :class="groupDescriptionClass"
            >
              {{ group.description }}
            </p>
          </div>

          <div
            :class="groupDividerClass"
            aria-hidden="true"
          />
        </div>

        <div
          :class="
            cn(
              'grid auto-rows-fr gap-4 md:gap-5',
              gridClassFor(group.columns, group.items.length),
              props.gridClass
            )
          "
        >
          <article
            v-for="(item, index) in group.items"
            :key="`${group.id}-${item.id}`"
            :class="cn(cardBaseClass, props.cardClass)"
          >
            <div class="flex h-full flex-col gap-3">
              <p
                v-if="variant === 'feature'"
                class="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                {{ item.meta || `Elemento ${String(index + 1).padStart(2, '0')}` }}
              </p>

              <h5
                v-if="item.title"
                :class="titleClass"
              >
                {{ item.title }}
              </h5>

              <p
                v-if="item.description"
                :class="descriptionClass"
              >
                {{ item.description }}
              </p>

              <div
                v-if="item.tags?.length"
                class="mt-auto flex flex-wrap gap-2 pt-1"
              >
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
</template>~/server/services/cms/catalog.service