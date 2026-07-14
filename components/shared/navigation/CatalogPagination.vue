<script setup lang="ts">
import { computed } from "vue";
import type { RouteLocationRaw } from "vue-router";

type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  basePath: string;
}>();

const normalizedTotalPages = computed(() => {
  const total = Math.floor(Number(props.totalPages));

  return Number.isFinite(total) && total > 0 ? total : 1;
});

const normalizedCurrentPage = computed(() => {
  const current = Math.floor(Number(props.currentPage));

  if (!Number.isFinite(current) || current < 1) {
    return 1;
  }

  return Math.min(current, normalizedTotalPages.value);
});

const paginationItems = computed<PaginationItem[]>(() => {
  const current = normalizedCurrentPage.value;
  const total = normalizedTotalPages.value;

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [1];

  if (current <= 4) {
    items.push(2, 3, 4, 5, "ellipsis-right", total);

    return items;
  }

  if (current >= total - 3) {
    items.push("ellipsis-left", total - 4, total - 3, total - 2, total - 1, total);

    return items;
  }

  items.push("ellipsis-left", current - 1, current, current + 1, "ellipsis-right", total);

  return items;
});

function pageTarget(page: number): RouteLocationRaw {
  if (page <= 1) {
    return {
      path: props.basePath,
    };
  }

  return {
    path: props.basePath,
    query: {
      page: String(page),
    },
  };
}

function itemKey(item: PaginationItem, index: number): string {
  return typeof item === "number" ? `page-${item}` : `${item}-${index}`;
}
</script>

<template>
  <nav
    v-if="normalizedTotalPages > 1"
    class="mt-8 flex flex-wrap items-center justify-center gap-2"
    aria-label="Paginación de productos"
  >
    <NuxtLink
      v-if="normalizedCurrentPage > 1"
      :to="pageTarget(normalizedCurrentPage - 1)"
      rel="prev"
      class="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      aria-label="Ir a la página anterior"
    >
      Anterior
    </NuxtLink>

    <template v-for="(item, index) in paginationItems" :key="itemKey(item, index)">
      <span
        v-if="typeof item !== 'number'"
        class="inline-flex min-h-10 min-w-8 items-center justify-center text-sm text-muted-foreground"
        aria-hidden="true"
      >
        …
      </span>

      <span
        v-else-if="item === normalizedCurrentPage"
        class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-primary bg-primary px-3 text-sm font-semibold text-primary-foreground"
        aria-current="page"
        :aria-label="`Página ${item}, página actual`"
      >
        {{ item }}
      </span>

      <NuxtLink
        v-else
        :to="pageTarget(item)"
        class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        :aria-label="`Ir a la página ${item}`"
      >
        {{ item }}
      </NuxtLink>
    </template>

    <NuxtLink
      v-if="normalizedCurrentPage < normalizedTotalPages"
      :to="pageTarget(normalizedCurrentPage + 1)"
      rel="next"
      class="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      aria-label="Ir a la página siguiente"
    >
      Siguiente
    </NuxtLink>
  </nav>
</template>
