<template>
  <div class="catalog-toolbar">
    <div>
      <p class="catalog-meta">
        Mostrando {{ resultsCount }} de {{ totalCount }} productos
      </p>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        :value="query"
        type="search"
        placeholder="Buscar productos"
        class="catalog-input sm:min-w-[260px]"
        @input="onQueryInput"
      />

      <select
        :value="sort"
        class="catalog-select"
        @change="onSortChange"
      >
        <option value="featured">Destacados</option>
        <option value="az">Nombre A-Z</option>
        <option value="za">Nombre Z-A</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  query: string
  sort: string
  resultsCount: number
  totalCount: number
}>()

const emit = defineEmits<{
  (e: 'update:query', value: string): void
  (e: 'update:sort', value: string): void
}>()

function onQueryInput(event: Event) {
  emit('update:query', (event.target as HTMLInputElement).value)
}

function onSortChange(event: Event) {
  emit('update:sort', (event.target as HTMLSelectElement).value)
}
</script>