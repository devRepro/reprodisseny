<script setup lang="ts">
import { computed } from "vue";
import type { ContentSectionKey, NormalizedCardItem } from "~/types/contentSections";

const props = defineProps<{
  item: NormalizedCardItem;
  sectionKey: ContentSectionKey;
}>();

const defaultIcons: Partial<Record<ContentSectionKey, string>> = {
  benefits: "lucide:badge-check",
  types: "lucide:layout-grid",
  formats: "lucide:ruler",
  materials: "lucide:layers-3",
  finishes: "lucide:sparkles",
  applications: "lucide:briefcase-business",
};

const icon = computed(() => {
  const explicit = String(props.item.icon || "").trim();
  if (explicit) return explicit.includes(":") ? explicit : `lucide:${explicit}`;
  return defaultIcons[props.sectionKey] || "lucide:circle-check";
});

const features = computed(() => {
  const values = props.item.features?.length ? props.item.features : props.item.tags;
  return Array.isArray(values) ? values.filter(Boolean) : [];
});
</script>

<template>
  <article class="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md md:p-6">
    <div class="mb-4 flex items-start justify-between gap-4">
      <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15" aria-hidden="true">
        <Icon :name="icon" class="size-4.5" />
      </span>

      <span v-if="item.meta" class="rounded-full bg-muted/70 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {{ item.meta }}
      </span>
    </div>

    <h4 class="mb-0 text-base font-semibold leading-snug tracking-tight text-foreground md:text-lg">
      {{ item.title }}
    </h4>

    <div
      v-if="item.descriptionHtml"
      class="mt-2 text-sm leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold [&_strong]:text-foreground"
      v-html="item.descriptionHtml"
    />
    <p v-else class="mb-0 mt-2 text-sm leading-7 text-muted-foreground">
      {{ item.description }}
    </p>

    <ul v-if="features.length" class="mt-5 flex list-none flex-wrap gap-2 p-0" aria-label="Características">
      <li v-for="feature in features" :key="feature" class="rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-medium text-foreground/75">
        {{ feature }}
      </li>
    </ul>

    <p v-if="item.idealFor" class="mb-0 mt-5 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
      <strong class="font-semibold text-foreground">Ideal para: </strong>{{ item.idealFor }}
    </p>
  </article>
</template>
