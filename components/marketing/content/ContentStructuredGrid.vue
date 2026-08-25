<script setup lang="ts">
import { computed } from "vue";
import type { ContentCardGroup, SectionViewModel } from "~/types/contentSections";
import ContentStructuredCard from "./ContentStructuredCard.vue";

const props = defineProps<{ section: SectionViewModel }>();

function normalizedHeading(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function showGroupTitle(group: ContentCardGroup) {
  return Boolean(
    group.title &&
      normalizedHeading(group.title) !== normalizedHeading(props.section.title)
  );
}

function gridClass(group: ContentCardGroup) {
  const count = group.items.length;
  if (count <= 1) return "max-w-2xl grid-cols-1";
  if (group.columns === 4) return "sm:grid-cols-2 xl:grid-cols-4";
  if (group.columns === 2) return "md:grid-cols-2";
  return "md:grid-cols-2 xl:grid-cols-3";
}

const hasContent = computed(() => props.section.groups.some((group) => group.items.length));
</script>

<template>
  <section v-if="hasContent" :aria-label="section.title" class="space-y-7 md:space-y-9">
    <p v-if="section.intro" class="mb-0 max-w-3xl text-base leading-7 text-muted-foreground">
      {{ section.intro }}
    </p>

    <section v-for="group in section.groups" :key="group.id" class="space-y-5">
      <div v-if="showGroupTitle(group)" class="space-y-2">
        <h3 class="mb-0 text-lg font-semibold tracking-tight text-foreground md:text-xl">
          {{ group.title }}
        </h3>
        <p v-if="group.intro" class="mb-0 max-w-3xl text-sm leading-7 text-muted-foreground">
          {{ group.intro }}
        </p>
      </div>

      <div :class="['grid auto-rows-fr gap-4 md:gap-5', gridClass(group)]">
        <ContentStructuredCard
          v-for="item in group.items"
          :key="item.id || item.title"
          :item="item"
          :section-key="section.key"
        />
      </div>
    </section>
  </section>
</template>
