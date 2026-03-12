<script setup lang="ts">
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
  (e: "clear"): void;
  (e: "update:selected-category", value: string | null): void;
}>();
</script>

<template>
  <div class="catalog-panel">
    <div class="flex items-center justify-between">
      <h2 class="text-label uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]">
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

      <div class="mt-3 space-y-2">
        <button
          type="button"
          class="catalog-filter-option"
          :class="{ 'catalog-filter-option-active': !props.selectedCategory }"
          @click="emit('update:selected-category', null)"
        >
          Todas
        </button>

        <button
          v-for="category in props.categories"
          :key="category.slug"
          type="button"
          class="catalog-filter-option"
          :class="{ 'catalog-filter-option-active': props.selectedCategory === category.slug }"
          @click="emit('update:selected-category', category.slug)"
        >
          {{ category.label || category.nav || category.title || category.slug }}
        </button>
      </div>
    </div>
  </div>
</template>