<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "#imports";
import PageContainer from "@/components/layout/PageContainer.vue";
import AppChip from "@/components/shared/pills/AppChip.vue";

type CategoryItem = {
  slug: string;
  title?: string;
  nav?: string;
  label?: string;
  path?: string;
  canonicalPath?: string;
  categoryPath?: string;
  slugPath?: string;
  fullPath?: string;
  url?: string;
};

const props = withDefaults(
  defineProps<{
    categories?: CategoryItem[];
    selectedCategory?: string | null;
  }>(),
  {
    categories: () => [],
    selectedCategory: null,
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

function buildCategoryTo(category: CategoryItem | null) {
  return {
    path: "/productos",
    query: {
      ...route.query,
      category: category?.slug || undefined,
      page: undefined,
    },
  };
}
</script>

<template>
  <PageContainer>
    <section class="py-3 md:py-4">
      <nav aria-label="Categorías del catálogo">
        <ul
          class="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible"
          role="list"
        >
          <li class="shrink-0">
            <AppChip
              :to="buildCategoryTo(null)"
              :active="!currentCategory"
              :aria-current="!currentCategory ? 'page' : undefined"
              class="whitespace-nowrap"
            >
              Todos
            </AppChip>
          </li>

          <li
            v-for="category in safeCategories"
            :key="category.slug"
            class="shrink-0"
          >
            <AppChip
              :to="buildCategoryTo(category)"
              :active="currentCategory === category.slug"
              :aria-current="
                currentCategory === category.slug ? 'page' : undefined
              "
              class="whitespace-nowrap"
            >
              {{ getCategoryLabel(category) }}
            </AppChip>
          </li>
        </ul>
      </nav>
    </section>
  </PageContainer>
</template>