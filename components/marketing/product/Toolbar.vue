<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    sort?: string;
    resultsCount?: number;
    totalCount?: number;
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

const sortOptions = [
  { value: "relevance", label: "Más relevantes" },
  { value: "name-asc", label: "Nombre A–Z" },
  { value: "name-desc", label: "Nombre Z–A" },
];

const safePage = computed(() => {
  return Number.isFinite(props.page) && Number(props.page) > 0
    ? Math.floor(Number(props.page))
    : 1;
});

const safePerPage = computed(() => {
  return Number.isFinite(props.perPage) && Number(props.perPage) > 0
    ? Math.floor(Number(props.perPage))
    : 12;
});

const safeTotal = computed(() => {
  return Number.isFinite(props.totalCount) && Number(props.totalCount) >= 0
    ? Math.floor(Number(props.totalCount))
    : 0;
});

const safeResultsCount = computed(() => {
  return Number.isFinite(props.resultsCount) && Number(props.resultsCount) >= 0
    ? Math.floor(Number(props.resultsCount))
    : 0;
});

const rangeStart = computed(() => {
  if (safeTotal.value === 0) return 0;
  return (safePage.value - 1) * safePerPage.value + 1;
});

const rangeEnd = computed(() => {
  if (safeTotal.value === 0) return 0;
  return Math.min(
    (safePage.value - 1) * safePerPage.value + safeResultsCount.value,
    safeTotal.value
  );
});

const summaryText = computed(() => {
  if (safeTotal.value === 0) {
    return "No hay resultados";
  }

  if (safeTotal.value <= safePerPage.value) {
    return safeTotal.value === 1
      ? "1 resultado"
      : `${safeTotal.value} resultados`;
  }

  return `Mostrando ${rangeStart.value}–${rangeEnd.value} de ${safeTotal.value}`;
});

function onSortChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  emit("update:sort", value);
}
</script>

<template>
  <div
    class="rounded-[24px] border border-border/70 bg-card p-4 shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)] md:p-5"
  >
    <div class="flex flex-col gap-4 md:gap-5">
      <div
        class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75">
            Catálogo
          </p>

          <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 class="text-lg font-semibold leading-tight text-foreground">
              Resultados
            </h2>

            <span
              class="inline-flex min-h-8 items-center justify-center rounded-full border border-border/60 bg-muted/25 px-3 py-1 text-xs font-medium text-foreground/70"
            >
              {{ summaryText }}
            </span>
          </div>
        </div>

        <div class="flex w-full flex-col gap-2 sm:w-auto">
          <label
            for="catalog-sort"
            class="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/60"
          >
            Ordenar por
          </label>

          <div class="relative min-w-[220px]">
            <select
              id="catalog-sort"
              :value="sort"
              class="min-h-12 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-sm font-medium text-foreground outline-none transition focus:border-primary/35 focus:ring-4 focus:ring-ring/20"
              @change="onSortChange"
            >
              <option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>

            <span
              aria-hidden="true"
              class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-foreground/45"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div
        class="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4"
      >
        <span
          class="inline-flex min-h-9 items-center justify-center rounded-full border border-border/60 bg-background px-3 py-2 text-sm text-foreground/70"
        >
          Página {{ safePage }}
        </span>

        <span
          class="inline-flex min-h-9 items-center justify-center rounded-full border border-border/60 bg-background px-3 py-2 text-sm text-foreground/70"
        >
          {{ safePerPage }} por página
        </span>

        <span
          v-if="safeTotal > 0"
          class="inline-flex min-h-9 items-center justify-center rounded-full border border-border/60 bg-background px-3 py-2 text-sm text-foreground/70"
        >
          {{ safeTotal === 1 ? "1 producto" : `${safeTotal} productos` }}
        </span>
      </div>
    </div>
  </div>
</template>