<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import PageContainer from "@/components/layout/PageContainer.vue";

const props = withDefaults(
  defineProps<{
    query: string;
    total: number;
    categoryName?: string;
  }>(),
  {
    categoryName: "",
  }
);

const emit = defineEmits<{
  "update:query": [value: string];
}>();

const localQuery = ref(props.query ?? "");
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.query,
  (next) => {
    const normalized = next ?? "";
    if (normalized !== localQuery.value) {
      localQuery.value = normalized;
    }
  }
);

function clearDebounce() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

function emitQuery(value: string, immediate = false) {
  clearDebounce();

  const normalized = value.trim();

  if (immediate) {
    emit("update:query", normalized);
    return;
  }

  debounceTimer = setTimeout(() => {
    emit("update:query", normalized);
    debounceTimer = null;
  }, 250);
}

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  localQuery.value = value;
  emitQuery(value);
}

function onSubmit() {
  emitQuery(localQuery.value, true);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && hasQuery.value) {
    clearQuery();
  }
}

function clearQuery() {
  localQuery.value = "";
  clearDebounce();
  emit("update:query", "");
}

onBeforeUnmount(() => {
  clearDebounce();
});

const hasQuery = computed(() => localQuery.value.trim().length > 0);

const normalizedCategoryName = computed(() => props.categoryName?.trim() || "");

const displayTitle = computed(() => {
  if (hasQuery.value) return `Resultados para “${localQuery.value.trim()}”`;
  return normalizedCategoryName.value || "Catálogo de productos";
});

const kickerText = computed(() => {
  if (hasQuery.value) return "Búsqueda";
  return normalizedCategoryName.value ? "Categoría" : "Catálogo de impresión";
});

const introText = computed(() => {
  if (hasQuery.value) {
    return "Ajusta la búsqueda para encontrar más rápido el soporte, material o acabado que necesitas.";
  }

  if (normalizedCategoryName.value) {
    return `Explora la categoría ${normalizedCategoryName.value} y encuentra la mejor solución para tu proyecto.`;
  }

  return "Encuentra el soporte o formato que necesitas y solicita presupuesto en pocos pasos.";
});

const resultsLabel = computed(() => {
  if (props.total === 1) return "producto disponible";
  return "productos disponibles";
});
</script>

<template>
  <section class="border-b border-slate-100 bg-slate-50/50 py-10 lg:py-16">
    <PageContainer>
      <div class="max-w-3xl">
        <p class="text-xs font-bold uppercase tracking-widest text-primary/60">
          {{ kickerText }}
        </p>

        <h1
          class="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl"
        >
          {{ displayTitle }}
        </h1>

        <p class="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
          {{ introText }}
        </p>

        <form
          class="relative mt-8 max-w-2xl"
          role="search"
          aria-label="Buscar productos del catálogo"
          @submit.prevent="onSubmit"
        >
          <label for="catalog-search" class="sr-only">
            Buscar productos del catálogo
          </label>

          <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <svg
              class="h-5 w-5 text-slate-400 transition-colors"
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
            id="catalog-search"
            :value="localQuery"
            type="search"
            inputmode="search"
            enterkeyhint="search"
            autocomplete="off"
            spellcheck="false"
            placeholder="Buscar en el catálogo: productos, materiales o usos"
            class="catalog-search-input w-full rounded-xl border border-slate-200 py-4 pl-12 pr-12 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
            @input="onInput"
            @keydown="onKeydown"
          />

          <button
            v-if="hasQuery"
            type="button"
            class="absolute inset-y-0 right-3 my-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Limpiar búsqueda"
            @click="clearQuery"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10l-4.95-4.95L5.05 3.636 10 8.586z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </form>

        <p class="mt-4 flex items-center gap-2 text-sm text-slate-500" aria-live="polite">
          <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          <strong>{{ props.total }}</strong>
          <span>{{ resultsLabel }}</span>
        </p>
      </div>
    </PageContainer>
  </section>
</template>

<style scoped>
.catalog-search-input::-webkit-search-cancel-button,
.catalog-search-input::-webkit-search-decoration,
.catalog-search-input::-webkit-search-results-button,
.catalog-search-input::-webkit-search-results-decoration {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}

.catalog-search-input::-ms-clear,
.catalog-search-input::-ms-reveal {
  display: none;
  width: 0;
  height: 0;
}
</style>
