<script setup lang="ts">
import { computed } from "vue";
import type { ProductListItem } from "@/types/product";
import ProductResultCard from "@/components/marketing/product/ResultCard.vue";

const props = withDefaults(
  defineProps<{
    products?: ProductListItem[];
    page?: number;
    totalPages?: number;
    total?: number;
    basePath?: string;
  }>(),
  {
    products: () => [],
    page: 1,
    totalPages: 1,
    total: 0,
    basePath: "/productos",
  }
);

const route = useRoute();

const safeProducts = computed(() =>
  (props.products || []).filter((p): p is ProductListItem =>
    Boolean(p && typeof p === "object" && p.slug && p.title)
  )
);

const paginationItems = computed<(number | "ellipsis")[]>(() => {
  const current = props.page;
  const total = props.totalPages;

  if (total <= 1) return [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) {
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
});

function pageTo(pageNumber: number) {
  const nextQuery = {
    ...route.query,
    page: pageNumber > 1 ? String(pageNumber) : undefined,
  };

  return {
    path: props.basePath,
    query: nextQuery,
  };
}
</script>

<template>
  <section>
    <div class="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
      <ProductResultCard
        v-for="product in safeProducts"
        :key="product.slug"
        :product="product"
      />
    </div>

    <nav
      v-if="totalPages > 1"
      class="mt-8 flex items-center justify-center gap-2"
      aria-label="Paginación de productos"
    >
      <NuxtLink
        v-if="page > 1"
        :to="pageTo(page - 1)"
        class="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
        rel="prev"
      >
        Anterior
      </NuxtLink>

      <template
        v-for="item in paginationItems"
        :key="item === 'ellipsis' ? `ellipsis-${Math.random()}` : `page-${item}`"
      >
        <span
          v-if="item === 'ellipsis'"
          class="px-2 text-sm text-slate-400"
          aria-hidden="true"
        >
          …
        </span>

        <NuxtLink
          v-else
          :to="pageTo(item)"
          class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border px-3 py-2 text-sm transition"
          :class="
            item === page
              ? 'border-primary bg-primary text-white'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
          "
          :aria-current="item === page ? 'page' : undefined"
        >
          {{ item }}
        </NuxtLink>
      </template>

      <NuxtLink
        v-if="page < totalPages"
        :to="pageTo(page + 1)"
        class="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
        rel="next"
      >
        Siguiente
      </NuxtLink>
    </nav>
  </section>
</template>
