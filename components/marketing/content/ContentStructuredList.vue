<script setup lang="ts">
import { computed } from "vue";
import type {
  ContentCardGroup,
  NormalizedCardItem,
  SectionViewModel,
} from "~/types/contentSections";

const props = withDefaults(
  defineProps<{
    section: SectionViewModel;
    showIntro?: boolean;
  }>(),
  {
    showIntro: true,
  }
);

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

function listClass(group: ContentCardGroup) {
  return group.items.length <= 1 ? "product-structured-list__grid--single" : "";
}

function featuresOf(item: NormalizedCardItem) {
  return Array.isArray(item.features) ? item.features.filter(Boolean) : [];
}

function tagsOf(item: NormalizedCardItem) {
  const tags = Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];
  const features = featuresOf(item);

  return tags.join("|") === features.join("|") ? [] : tags;
}

const hasContent = computed(() =>
  props.section.groups.some((group) => group.items.length)
);
</script>

<template>
  <div
    v-if="hasContent"
    :class="['product-structured-list', `product-structured-list--${section.key}`]"
  >
    <p v-if="showIntro && section.intro" class="product-structured-list__intro">
      {{ section.intro }}
    </p>

    <section
      v-for="group in section.groups"
      :key="group.id"
      class="product-structured-list__group"
    >
      <div v-if="showGroupTitle(group)" class="product-structured-list__group-header">
        <h4 class="product-structured-list__group-title">
          {{ group.title }}
        </h4>
        <p v-if="group.intro" class="product-structured-list__group-intro">
          {{ group.intro }}
        </p>
      </div>

      <div :class="['product-structured-list__grid', listClass(group)]">
        <article
          v-for="item in group.items"
          :key="item.id || item.title"
          class="product-structured-list__item"
        >
          <div class="product-structured-list__item-header">
            <h5 class="product-structured-list__item-title">
              {{ item.title }}
            </h5>
            <p v-if="item.meta" class="product-structured-list__meta">
              {{ item.meta }}
            </p>
          </div>

          <div
            v-if="item.descriptionHtml"
            class="product-structured-list__description"
            v-html="item.descriptionHtml"
          />
          <p v-else class="product-structured-list__description">
            {{ item.description }}
          </p>

          <p v-if="item.idealFor" class="product-structured-list__auxiliary">
            <strong>Ideal para: </strong>{{ item.idealFor }}
          </p>

          <div
            v-if="featuresOf(item).length || tagsOf(item).length"
            class="product-structured-list__auxiliary-group"
          >
            <p v-if="featuresOf(item).length" class="product-structured-list__auxiliary">
              <strong>Características: </strong>{{ featuresOf(item).join(", ") }}
            </p>
            <p v-if="tagsOf(item).length" class="product-structured-list__auxiliary">
              <strong>Etiquetas: </strong>{{ tagsOf(item).join(", ") }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

