<script setup lang="ts">
import { computed, ref } from "vue";

type CategoryItem = {
  id?: string | number;
  slug?: string;
  label?: string;
  nav?: string;
  title?: string;
  count?: number;
  children?: CategoryItem[];
};

type FlatCategoryItem = {
  value: string;
  label: string;
  count?: number;
  depth: number;
};

const props = withDefaults(
  defineProps<{
    categories?: CategoryItem[];
    selectedCategory?: string;
  }>(),
  {
    categories: () => [],
    selectedCategory: "",
  }
);

const emit = defineEmits<{
  "update:selected-category": [value: string | null];
  clear: [];
}>();

const localCategoryQuery = ref("");

function normalizeValue(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function getCategoryLabel(item: CategoryItem) {
  return String(item.label || item.nav || item.title || "").trim();
}

function getCategoryValue(item: CategoryItem) {
  return normalizeValue(item.slug || item.id || "");
}

function flattenCategories(
  items: CategoryItem[],
  depth = 0,
  acc: FlatCategoryItem[] = []
): FlatCategoryItem[] {
  for (const item of items) {
    const value = getCategoryValue(item);
    const label = getCategoryLabel(item);

    if (!value || !label) continue;

    acc.push({
      value,
      label,
      count:
        typeof item.count === "number" && Number.isFinite(item.count)
          ? item.count
          : undefined,
      depth,
    });

    if (Array.isArray(item.children) && item.children.length) {
      flattenCategories(item.children, depth + 1, acc);
    }
  }

  return acc;
}

const flatCategories = computed(() =>
  flattenCategories(props.categories || [])
);

const normalizedSelectedCategory = computed(() =>
  normalizeValue(props.selectedCategory)
);

const filteredCategories = computed(() => {
  const query = normalizeValue(localCategoryQuery.value);

  if (!query) return flatCategories.value;

  return flatCategories.value.filter((item) =>
    normalizeValue(item.label).includes(query)
  );
});

const hasActiveFilter = computed(() => Boolean(normalizedSelectedCategory.value));

function selectCategory(value: string | null) {
  emit("update:selected-category", value ? normalizeValue(value) : null);
}

function clearAll() {
  localCategoryQuery.value = "";
  emit("update:selected-category", null);
  emit("clear");
}
</script>

<template>
  <div class="space-y-5">
    <div class="rounded-[24px] border border-border/70 bg-card p-5 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75">
            Catálogo
          </p>
          <h3 class="mt-2 text-lg font-semibold leading-tight text-foreground">
            Categorías
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
            Filtra el catálogo por familia de producto.
          </p>
        </div>

        <button
          v-if="hasActiveFilter || localCategoryQuery"
          type="button"
          class="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/25 hover:text-primary"
          @click="clearAll"
        >
          Limpiar
        </button>
      </div>

      <div class="mt-5">
        <label for="catalog-category-search" class="sr-only">
          Buscar categoría
        </label>

        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <svg
              class="h-4 w-4 text-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            id="catalog-category-search"
            v-model="localCategoryQuery"
            type="search"
            inputmode="search"
            autocomplete="off"
            placeholder="Buscar categoría"
            class="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/35 focus:ring-4 focus:ring-ring/20"
          />
        </div>
      </div>

      <div class="mt-5 space-y-2">
        <button
          type="button"
          class="flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition"
          :class="
            !normalizedSelectedCategory
              ? 'border-primary/30 bg-primary/5'
              : 'border-border/50 bg-background hover:border-primary/20 hover:bg-muted/20'
          "
          @click="selectCategory(null)"
        >
          <span
            class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
            :class="!normalizedSelectedCategory ? 'bg-primary' : 'bg-foreground/20'"
            aria-hidden="true"
          />
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-medium text-foreground">
              Todas las categorías
            </span>
            <span class="mt-1 block text-xs text-muted-foreground">
              Mostrar el catálogo completo
            </span>
          </span>
        </button>

        <button
          v-for="item in filteredCategories"
          :key="item.value"
          type="button"
          class="flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition"
          :class="
            item.value === normalizedSelectedCategory
              ? 'border-primary/30 bg-primary/5'
              : 'border-border/50 bg-background hover:border-primary/20 hover:bg-muted/20'
          "
          @click="selectCategory(item.value)"
        >
          <span
            class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
            :class="
              item.value === normalizedSelectedCategory ? 'bg-primary' : 'bg-foreground/20'
            "
            aria-hidden="true"
          />

          <span class="min-w-0 flex-1">
            <span
              class="block text-sm font-medium leading-[1.45] text-foreground"
              :style="{ paddingLeft: `${item.depth * 14}px` }"
            >
              {{ item.label }}
            </span>

            <span
              v-if="typeof item.count === 'number'"
              class="mt-1 block text-xs text-muted-foreground"
              :style="{ paddingLeft: `${item.depth * 14}px` }"
            >
              {{ item.count === 1 ? "1 producto" : `${item.count} productos` }}
            </span>
          </span>
        </button>

        <div
          v-if="!filteredCategories.length"
          class="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-4 text-sm text-muted-foreground"
        >
          No hay categorías que coincidan con tu búsqueda.
        </div>
      </div>
    </div>
  </div>
</template>