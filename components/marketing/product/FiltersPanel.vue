<script setup lang="ts">
import { computed } from "vue";

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
    basePath: "/catalogo",
  }
);

const emit = defineEmits<{
  clear: [];
}>();

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
    path: slug ? `${props.basePath}/${slug}` : props.basePath,
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
  <div class="catalog-panel">
    <div class="flex items-center justify-between">
      <h2
        class="text-label uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]"
      >
        Filtros
      </h2>

      <button
        type="button"
        class="text-body-s text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]"
        @click="emit('clear')"
      >
        Limpiar
      </button>
    </div>

    <div class="mt-5">
      <p class="catalog-kicker">Categoría</p>

      <nav class="mt-3 space-y-2" aria-label="Filtrar por categoría">
        <NuxtLink
          :to="buildCategoryTo(null)"
          class="catalog-filter-option block"
          :class="{ 'catalog-filter-option-active': !currentCategory }"
          :aria-current="!currentCategory ? 'page' : undefined"
        >
          Todas
        </NuxtLink>

        <NuxtLink
          v-for="category in safeCategories"
          :key="category.slug"
          :to="buildCategoryTo(category.slug)"
          class="catalog-filter-option block"
          :class="{ 'catalog-filter-option-active': currentCategory === category.slug }"
          :aria-current="currentCategory === category.slug ? 'page' : undefined"
        >
          {{ getCategoryLabel(category) }}
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>
