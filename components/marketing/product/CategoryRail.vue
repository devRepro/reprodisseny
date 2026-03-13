<script setup lang="ts">
import { computed } from "vue";
import PageContainer from "@/components/layout/PageContainer.vue";

type CategoryItem = {
  slug: string;
  title?: string;
  nav?: string;
  label?: string;
};

const props = withDefaults(
  defineProps<{
    categories?: CategoryItem[];
    selectedCategory?: string | null;
    basePath?: string;
  }>(),
  {
    categories: () => [],
    selectedCategory: null,
    basePath: "/productos",
  }
);

const route = useRoute();

function normalizeSlug(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

const currentCategory = computed(() => normalizeSlug(props.selectedCategory));

const safeCategories = computed(() =>
  (props.categories || [])
    .filter((category): category is CategoryItem => Boolean(category?.slug))
    .map((category) => ({
      ...category,
      slug: normalizeSlug(category.slug),
    }))
);

function getCategoryLabel(category: CategoryItem) {
  return category.label || category.nav || category.title || category.slug;
}

function buildCategoryTo(slug: string | null) {
  return {
    path: slug ? `/${slug}` : "/productos",
    query: {
      q: typeof route.query.q === "string" ? route.query.q : undefined,
      sort:
        typeof route.query.sort === "string" && route.query.sort !== "relevance"
          ? route.query.sort
          : undefined,
    },
  };
}
</script>

<template>
  <PageContainer>
    <section class="pb-2">
      <nav class="flex flex-wrap gap-3" aria-label="Categorías del catálogo">
        <NuxtLink
          :to="buildCategoryTo(null)"
          class="catalog-chip"
          :class="{ 'catalog-chip-active': !currentCategory }"
          :aria-current="!currentCategory ? 'page' : undefined"
        >
          Todos
        </NuxtLink>

        <NuxtLink
          v-for="category in safeCategories"
          :key="category.slug"
          :to="buildCategoryTo(category.slug)"
          class="catalog-chip"
          :class="{ 'catalog-chip-active': currentCategory === category.slug }"
          :aria-current="currentCategory === category.slug ? 'page' : undefined"
        >
          {{ getCategoryLabel(category) }}
        </NuxtLink>
      </nav>
    </section>
  </PageContainer>
</template>
