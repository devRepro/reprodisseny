<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  useAsyncData,
  useHead,
  useRoute,
  useRouter,
  useSeoMeta,
} from "#imports";
import { Search, X } from "lucide-vue-next";

import PageContainer from "@/components/layout/PageContainer.vue";
import AppButton from "@/components/shared/button/AppButton.vue";
import SearchResultCard from "@/components/search/SearchResultCard.vue";

type SearchResultItem = {
  id: string;
  kind: "producto" | "categoria";
  title: string;
  href: string;
  image?: string | null;

  description?: string;
  eyebrow?: string;
  categoryLabel?: string;
  tags?: string[];
};

type SearchResultsResponse = {
  q: string;
  items: SearchResultItem[];
};

type ActiveFilter = "all" | "producto" | "categoria";

const route = useRoute();
const router = useRouter();

const q = computed(() =>
  typeof route.query.q === "string" ? route.query.q.trim() : ""
);

const activeFilter = computed<ActiveFilter>(() => {
  const value = route.query.tipo;

  if (value === "producto" || value === "categoria") {
    return value;
  }

  return "all";
});

const localQ = ref(q.value);

watch(q, (value) => {
  localQ.value = value;
});

function submit() {
  const term = localQ.value.trim();

  router.push({
    path: "/buscar",
    query: {
      q: term || undefined,
      tipo: activeFilter.value === "all" ? undefined : activeFilter.value,
    },
  });
}

function clearQuery() {
  localQ.value = "";

  router.push({
    path: "/buscar",
    query: {
      tipo: activeFilter.value === "all" ? undefined : activeFilter.value,
    },
  });
}

function setFilter(filter: ActiveFilter) {
  router.push({
    path: "/buscar",
    query: {
      q: q.value || undefined,
      tipo: filter === "all" ? undefined : filter,
    },
  });
}

const { data, pending, error } = await useAsyncData(
  () => `search:${q.value}`,
  () => {
    if (!q.value) {
      return Promise.resolve({ q: "", items: [] as SearchResultItem[] });
    }

    return $fetch<SearchResultsResponse>("/api/search/results", {
  query: { q: q.value, limit: 30 },
});
  },
  {
    watch: [q],
  }
);

useHead({
  meta: [{ name: "robots", content: "noindex, follow" }],
});

useSeoMeta({
  title: () =>
    q.value ? `Buscar “${q.value}” | Reprodisseny` : "Buscar | Reprodisseny",
  robots: "noindex,follow",
});

const items = computed(() => data.value?.items ?? []);

const products = computed(() =>
  items.value.filter((item) => item.kind === "producto")
);

const categories = computed(() =>
  items.value.filter((item) => item.kind === "categoria")
);

const totalResults = computed(() => items.value.length);
const hasQuery = computed(() => q.value.length > 0);

const filteredItems = computed(() => {
  if (activeFilter.value === "producto") return products.value;
  if (activeFilter.value === "categoria") return categories.value;

  return items.value;
});

const filters = computed(() => [
  {
    key: "all" as const,
    label: "Todo",
    count: totalResults.value,
  },
  {
    key: "producto" as const,
    label: "Productos",
    count: products.value.length,
  },
  {
    key: "categoria" as const,
    label: "Categorías",
    count: categories.value.length,
  },
]);

const resultsSummary = computed(() => {
  if (!hasQuery.value || pending.value || error.value) return "";
  if (!totalResults.value) return "Sin resultados";

  return totalResults.value === 1
    ? "1 resultado encontrado"
    : `${totalResults.value} resultados encontrados`;
});

const popularSearches = [
  "adhesivos",
  "vinilos",
  "roll up",
  "tarjetas",
  "packaging",
  "catálogos",
];
</script>

<template>
  <main class="min-h-screen bg-background">
    <section class="border-b border-border/70 bg-[hsl(var(--brand-base-light))]/50">
      <PageContainer>
        <div class="py-8 md:py-10">
          <div class="mx-auto max-w-4xl text-center">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Búsqueda global
            </p>

            <h1
              class="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-tight text-foreground"
            >
              Encuentra productos y soluciones de impresión
            </h1>

            <p class="mx-auto mt-4 max-w-2xl text-body leading-relaxed text-foreground/70">
              Busca por producto, material, aplicación o categoría y accede rápidamente
              a la ficha más adecuada.
            </p>

            <form
              class="mx-auto mt-7 max-w-3xl"
              role="search"
              aria-label="Buscar en toda la web"
              @submit.prevent="submit"
            >
              <div
                class="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-2 shadow-sm md:flex-row md:items-center"
              >
                <div class="relative flex-1">
                  <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                    <Search class="h-5 w-5 text-muted-foreground" />
                  </div>

                  <input
                    v-model="localQ"
                    type="search"
                    inputmode="search"
                    autocomplete="off"
                    spellcheck="false"
                    placeholder="Buscar adhesivos, vinilos, roll up, packaging…"
                    class="search-page-input min-h-12 w-full rounded-xl border-0 bg-transparent py-3 pl-12 pr-12 text-base text-foreground outline-none placeholder:text-muted-foreground"
                  />

                  <button
                    v-if="localQ"
                    type="button"
                    class="absolute inset-y-0 right-2 inline-flex w-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Limpiar búsqueda"
                    @click="clearQuery"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>

                <AppButton type="submit" size="lg" class="md:self-stretch">
                  Buscar
                </AppButton>
              </div>
            </form>

            <div
              v-if="!hasQuery"
              class="mt-5 flex flex-wrap items-center justify-center gap-2"
            >
              <span class="text-sm text-muted-foreground">
                Búsquedas frecuentes:
              </span>

              <NuxtLink
                v-for="term in popularSearches"
                :key="term"
                :to="{ path: '/buscar', query: { q: term } }"
                class="inline-flex min-h-9 items-center rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm font-medium text-foreground/75 transition hover:border-primary/30 hover:text-primary"
              >
                {{ term }}
              </NuxtLink>
            </div>

            <div
              v-if="hasQuery"
              class="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground"
            >
              <span>
                Resultados para:
                <span class="font-semibold text-foreground">“{{ q }}”</span>
              </span>

              <span
                v-if="resultsSummary"
                class="inline-flex min-h-9 items-center rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm text-foreground/75"
              >
                {{ resultsSummary }}
              </span>

              <AppButton
                :to="{ path: '/productos', query: { q } }"
                variant="outline"
                size="sm"
                arrow
              >
                Ver en catálogo
              </AppButton>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>

    <PageContainer>
      <section class="py-8 lg:py-12">
        <div
          v-if="!hasQuery"
          class="rounded-2xl border border-border/70 bg-card p-6 shadow-sm md:p-8"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Empieza aquí
          </p>

          <h2
            class="mt-2 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold leading-tight text-foreground"
          >
            Escribe lo que necesitas imprimir
          </h2>

          <p class="mt-3 max-w-2xl text-body leading-relaxed text-foreground/70">
            Puedes buscar por producto, material, sector o aplicación. Por ejemplo:
            adhesivos, vinilo para cristal, roll up, cajas o cartas de restaurante.
          </p>
        </div>

        <div
          v-else-if="pending"
          class="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-border/70 bg-card p-8 shadow-sm"
        >
          <div
            class="h-11 w-11 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
          />
          <p class="mt-4 text-body text-muted-foreground">Buscando resultados…</p>
        </div>

        <div
          v-else-if="error"
          class="rounded-2xl border border-border/70 bg-card p-6 shadow-sm md:p-8"
        >
          <h2
            class="text-[clamp(1.4rem,2.4vw,2rem)] font-semibold leading-tight text-foreground"
          >
            No se ha podido cargar la búsqueda
          </h2>

          <p class="mt-3 max-w-2xl text-body leading-relaxed text-foreground/70">
            Ha ocurrido un problema al recuperar los resultados. Vuelve a intentarlo
            con otra búsqueda o recarga la página.
          </p>
        </div>

        <div
          v-else-if="items.length === 0"
          class="rounded-2xl border border-border/70 bg-card p-6 shadow-sm md:p-8"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Sin resultados
          </p>

          <h2
            class="mt-2 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold leading-tight text-foreground"
          >
            No hemos encontrado resultados para “{{ q }}”
          </h2>

          <p class="mt-3 max-w-2xl text-body leading-relaxed text-foreground/70">
            Prueba con una palabra más general o entra directamente al catálogo para
            navegar por categorías.
          </p>

          <div class="mt-6 flex flex-wrap gap-3">
            <AppButton to="/productos" variant="primary" size="md" arrow>
              Ir al catálogo
            </AppButton>

            <AppButton to="/contacto" variant="outline" size="md" arrow>
              Pedir asesoramiento
            </AppButton>
          </div>
        </div>

        <div v-else class="space-y-8">
          <div
            class="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Resultados
              </p>

              <h2
                class="mt-2 text-[clamp(1.6rem,2.5vw,2.25rem)] font-semibold leading-tight text-foreground"
              >
                {{
                  activeFilter === "all"
                    ? "Todos los resultados"
                    : activeFilter === "producto"
                      ? "Productos"
                      : "Categorías"
                }}
              </h2>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="filter in filters"
                :key="filter.key"
                type="button"
                class="inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition"
                :class="
                  activeFilter === filter.key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border/70 bg-card text-foreground/75 hover:border-primary/30 hover:text-primary'
                "
                @click="setFilter(filter.key)"
              >
                {{ filter.label }}

                <span
                  class="rounded-full px-2 py-0.5 text-xs"
                  :class="
                    activeFilter === filter.key
                      ? 'bg-white/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  "
                >
                  {{ filter.count }}
                </span>
              </button>
            </div>
          </div>

          <div
            v-if="filteredItems.length"
            class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            <SearchResultCard
  v-for="item in filteredItems"
  :key="item.id"
  :title="item.title"
  :href="item.href"
  :kind="item.kind"
  :image="item.image"
  :description="item.description"
  :eyebrow="item.eyebrow"
  :category-label="item.categoryLabel"
  :tags="item.tags"
/>
          </div>

          <div
            v-else
            class="rounded-2xl border border-border/70 bg-card p-6 text-body text-foreground/70 shadow-sm"
          >
            No hay resultados en este filtro. Prueba con “Todo” o cambia el término
            de búsqueda.
          </div>
        </div>
      </section>
    </PageContainer>
  </main>
</template>

<style scoped>
.search-page-input::-webkit-search-cancel-button,
.search-page-input::-webkit-search-decoration,
.search-page-input::-webkit-search-results-button,
.search-page-input::-webkit-search-results-decoration {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}

.search-page-input::-ms-clear,
.search-page-input::-ms-reveal {
  display: none;
  width: 0;
  height: 0;
}
</style>
