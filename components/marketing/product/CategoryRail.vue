<script setup lang="ts">
import PageContainer from "@/components/layout/PageContainer.vue";

type CategoryItem = {
  slug: string;
  title?: string;
  nav?: string;
  label?: string;
};

const props = defineProps<{
  categories: CategoryItem[];
  selectedCategory?: string | null;
}>();

const emit = defineEmits<{
  (e: "select-category", value: string | null): void;
}>();
</script>

<template>
  <PageContainer>
    <section class="pb-2">
      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="catalog-chip"
          :class="{ 'catalog-chip-active': !props.selectedCategory }"
          @click="emit('select-category', null)"
        >
          Todos
        </button>

        <button
          v-for="category in props.categories"
          :key="category.slug"
          type="button"
          class="catalog-chip"
          :class="{ 'catalog-chip-active': props.selectedCategory === category.slug }"
          @click="emit('select-category', category.slug)"
        >
          {{ category.label || category.nav || category.title || category.slug }}
        </button>
      </div>
    </section>
  </PageContainer>
</template>