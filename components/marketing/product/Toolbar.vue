<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    sort: string;
    resultsCount: number;
    totalCount: number;
    page?: number;
    perPage?: number;
  }>(),
  {
    sort: "relevance",
    resultsCount: 0,
    totalCount: 0,
    page: 1,
    perPage: 12,
  }
);

const emit = defineEmits<{
  "update:sort": [value: string];
}>();

function onSortChange(event: Event) {
  emit("update:sort", (event.target as HTMLSelectElement).value);
}

const resultsText = computed(() => {
  if (props.totalCount === 0) return "No hay productos";
  if (props.totalCount === 1) return "Mostrando 1 producto";

  const start = (props.page - 1) * props.perPage + 1;
  const end = Math.min(start + props.resultsCount - 1, props.totalCount);

  if (start <= 0 || end <= 0) {
    return `${props.totalCount} productos`;
  }

  return `Mostrando ${start}–${end} de ${props.totalCount} productos`;
});

const isSortDisabled = computed(() => props.totalCount === 0);
</script>

<template>
  <div
    class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
  >
    <div class="min-w-0">
      <p class="text-sm font-medium text-slate-700" aria-live="polite">
        {{ resultsText }}
      </p>

      <p class="mt-1 text-sm text-slate-500">
        Ordena los resultados para encontrar el producto adecuado más rápido.
      </p>
    </div>

    <div class="sm:min-w-[220px]">
      <label for="catalog-toolbar-sort" class="sr-only">
        Ordenar productos
      </label>

      <select
        id="catalog-toolbar-sort"
        :value="sort"
        :disabled="isSortDisabled"
        class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
        @change="onSortChange"
      >
        <option value="relevance">Relevancia</option>
        <option value="az">Nombre A-Z</option>
        <option value="za">Nombre Z-A</option>
      </select>
    </div>
  </div>
</template>