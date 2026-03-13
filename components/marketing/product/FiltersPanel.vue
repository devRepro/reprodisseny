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
  }>(),
  {
    categories: () => [],
    selectedCategory: null,
  }
);

const emit = defineEmits<{
  "update:selected-category": [value: string | null];
  clear: [];
}>();

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

function selectCategory(slug: string | null) {
  emit("update:selected-category", slug ? normalizeSlug(slug) : null);
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

      <div class="mt-3 space-y-2" aria-label="Filtrar por categoría">
        <button
          type="button"
          class="catalog-filter-option block w-full text-left"
          :class="{ 'catalog-filter-option-active': !currentCategory }"
          :aria-pressed="!currentCategory"
          @click="selectCategory(null)"
        >
          Todas
        </button>

        <button
          v-for="category in safeCategories"
          :key="category.slug"
          type="button"
          class="catalog-filter-option block w-full text-left"
          :class="{ 'catalog-filter-option-active': currentCategory === category.slug }"
          :aria-pressed="currentCategory === category.slug"
          @click="selectCategory(category.slug)"
        >
          {{ getCategoryLabel(category) }}
        </button>
      </div>
    </div>
  </div>
</template>