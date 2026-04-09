<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Search } from "lucide-vue-next";

type SuggestItem = {
  id: string;
  kind: "producto" | "categoria";
  title: string;
  href: string;
  image?: string | null;
};

const route = useRoute();
const router = useRouter();

const q = computed(() => (typeof route.query.q === "string" ? route.query.q.trim() : ""));
const localQ = ref(q.value);

watch(q, (v) => {
  localQ.value = v;
});

function submit() {
  const term = localQ.value.trim();

  router.push({
    path: "/buscar",
    query: {
      q: term || undefined,
    },
  });
}

function clearQuery() {
  localQ.value = "";
  router.push({
    path: "/buscar",
    query: {
      q: undefined,
    },
  });
}

const { data, pending, error } = await useAsyncData(
  () => `search:${q.value}`,
  () => {
    if (!q.value) return Promise.resolve({ q: "", items: [] as SuggestItem[] });

    return $fetch<{ q: string; items: SuggestItem[] }>("/api/search/results", {
      query: { q: q.value, limit: 30, force: "1" },
    });
  }
);

useHead({
  meta: [{ name: "robots", content: "noindex, follow" }],
});

useSeoMeta({
  title: () => (q.value ? `Buscar “${q.value}” | Reprodisseny` : "Buscar | Reprodisseny"),
  robots: "noindex,follow",
});

const items = computed(() => data.value?.items ?? []);
const products = computed(() => items.value.filter((i) => i.kind === "producto"));
const categories = computed(() => items.value.filter((i) => i.kind === "categoria"));
const totalResults = computed(() => items.value.length);

const hasQuery = computed(() => q.value.length > 0);

const resultsSummary = computed(() => {
  if (!hasQuery.value || pending.value || error.value) return "";
  if (!totalResults.value) return "No hemos encontrado resultados para esta búsqueda.";

  return totalResults.value === 1
    ? "1 resultado encontrado"
    : `${totalResults.value} resultados encontrados`;
});
</script>

<template>
  <main class="min-h-screen bg-background">
    <section class="border-b border-border/60 bg-muted/15">
      <div class="container-content py-10 md:py-14">
        <div class="max-w-4xl">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75">
            Búsqueda global
          </p>

          <h1
            class="mt-3 text-[34px] font-semibold leading-[1.05] text-foreground md:text-[46px]"
          >
            Buscar en toda la web
          </h1>

          <p class="mt-4 max-w-[70ch] text-body leading-[1.7] text-foreground/72">
            Encuentra productos, categorías y accesos relevantes desde una única búsqueda.
          </p>

          <form
            class="relative mt-8 max-w-3xl"
            role="search"
            aria-label="Buscar en toda la web"
            @submit.prevent="submit"
          >
            <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <Search class="h-5 w-5 text-foreground/40" />
            </div>

            <input
              v-model="localQ"
              type="search"
              inputmode="search"
              autocomplete="off"
              spellcheck="false"
              placeholder="Buscar productos, categorías o contenidos"
              class="search-page-input min-h-14 w-full rounded-2xl border border-border/70 bg-card py-4 pl-12 pr-24 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/35 focus:ring-4 focus:ring-ring/20"
            />

            <div class="absolute inset-y-0 right-3 flex items-center gap-2">
              <button
                v-if="localQ"
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground/45 transition hover:bg-muted hover:text-foreground"
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

              <button
                type="submit"
                class="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Buscar
              </button>
            </div>
          </form>

          <div
            class="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
          >
            <span v-if="hasQuery">
              Resultados para:
              <span class="font-medium text-foreground">“{{ q }}”</span>
            </span>

            <span
              v-if="resultsSummary"
              class="inline-flex min-h-9 items-center justify-center rounded-full border border-border/60 bg-card px-3 py-2 text-sm text-foreground/72"
            >
              {{ resultsSummary }}
            </span>

            <NuxtLink
              v-if="hasQuery"
              :to="{ path: '/productos', query: { q } }"
              class="inline-flex min-h-9 items-center justify-center rounded-full border border-border/60 bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/25 hover:text-primary"
            >
              Ver resultados en el catálogo
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="container-content">
      <div
        v-if="!hasQuery"
        class="rounded-[28px] border border-border/70 bg-card p-8 shadow-sm"
      >
        <h2 class="text-[24px] font-semibold leading-[1.15] text-foreground">
          Empieza escribiendo una búsqueda
        </h2>
        <p class="mt-3 max-w-[62ch] text-body leading-[1.7] text-foreground/72">
          Puedes buscar productos, categorías y contenidos relacionados para acceder más
          rápido a la información que necesitas.
        </p>
      </div>

      <div
        v-else-if="pending"
        class="flex min-h-[300px] flex-col items-center justify-center rounded-[28px] border border-border/70 bg-card p-8 shadow-sm"
      >
        <div
          class="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
        />
        <p class="mt-4 text-body text-muted-foreground">Buscando resultados…</p>
      </div>

      <div
        v-else-if="error"
        class="rounded-[28px] border border-border/70 bg-card p-8 shadow-sm"
      >
        <h2 class="text-[24px] font-semibold leading-[1.15] text-foreground">
          No se ha podido cargar la búsqueda
        </h2>
        <p class="mt-3 max-w-[62ch] text-body leading-[1.7] text-foreground/72">
          Ha ocurrido un problema al recuperar los resultados. Vuelve a intentarlo con
          otra búsqueda o recarga la página.
        </p>
      </div>

      <div
        v-else-if="items.length === 0"
        class="rounded-[28px] border border-border/70 bg-card p-8 shadow-sm"
      >
        <h2 class="text-[24px] font-semibold leading-[1.15] text-foreground">
          No hay resultados para mostrar
        </h2>
        <p class="mt-3 max-w-[62ch] text-body leading-[1.7] text-foreground/72">
          Prueba con otro término, usa una palabra más general o navega directamente por
          el catálogo.
        </p>

        <div class="mt-6">
          <NuxtLink
            to="/productos"
            class="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-body-s-bold text-primary-foreground transition hover:opacity-90"
          >
            Ir al catálogo
          </NuxtLink>
        </div>
      </div>

      <div v-else class="space-y-12">
        <section
          v-if="products.length"
          class="space-y-5"
          aria-labelledby="search-products"
        >
          <div class="flex items-end justify-between gap-4">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75"
              >
                Resultados
              </p>
              <h2
                id="search-products"
                class="mt-2 text-[28px] font-semibold leading-[1.12] text-foreground"
              >
                Productos
              </h2>
            </div>

            <span
              class="inline-flex min-h-9 items-center justify-center rounded-full border border-border/60 bg-card px-3 py-2 text-sm text-foreground/72"
            >
              {{
                products.length === 1 ? "1 resultado" : `${products.length} resultados`
              }}
            </span>
          </div>

          <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <NuxtLink
              v-for="it in products"
              :key="it.id"
              :to="it.href"
              class="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_40px_-26px_hsl(var(--foreground)/0.18)]"
            >
              <div class="aspect-[16/10] overflow-hidden bg-muted/25">
                <NuxtImg
                  v-if="it.image"
                  :src="it.image"
                  width="640"
                  height="420"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  :alt="it.title"
                />
                <div v-else class="h-full w-full bg-muted/40" />
              </div>

              <div class="flex flex-1 flex-col px-5 py-5">
                <p
                  class="text-xs font-semibold uppercase tracking-[0.14em] text-primary/75"
                >
                  Producto
                </p>

                <h3 class="mt-2 text-[20px] font-semibold leading-[1.25] text-foreground">
                  {{ it.title }}
                </h3>

                <span
                  class="mt-5 inline-flex min-h-11 items-center justify-center self-start rounded-lg border border-border bg-background px-4 py-2.5 text-body-s-bold text-foreground transition group-hover:border-primary/25 group-hover:text-primary"
                >
                  Ver producto
                </span>
              </div>
            </NuxtLink>
          </div>
        </section>

        <section
          v-if="categories.length"
          class="space-y-5"
          aria-labelledby="search-categories"
        >
          <div class="flex items-end justify-between gap-4">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75"
              >
                Resultados
              </p>
              <h2
                id="search-categories"
                class="mt-2 text-[28px] font-semibold leading-[1.12] text-foreground"
              >
                Categorías
              </h2>
            </div>

            <span
              class="inline-flex min-h-9 items-center justify-center rounded-full border border-border/60 bg-card px-3 py-2 text-sm text-foreground/72"
            >
              {{
                categories.length === 1
                  ? "1 resultado"
                  : `${categories.length} resultados`
              }}
            </span>
          </div>

          <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <NuxtLink
              v-for="it in categories"
              :key="it.id"
              :to="it.href"
              class="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_40px_-26px_hsl(var(--foreground)/0.18)]"
            >
              <div class="aspect-[16/10] overflow-hidden bg-muted/25">
                <NuxtImg
                  v-if="it.image"
                  :src="it.image"
                  width="640"
                  height="420"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  :alt="it.title"
                />
                <div v-else class="h-full w-full bg-muted/40" />
              </div>

              <div class="flex flex-1 flex-col px-5 py-5">
                <p
                  class="text-xs font-semibold uppercase tracking-[0.14em] text-primary/75"
                >
                  Categoría
                </p>

                <h3 class="mt-2 text-[20px] font-semibold leading-[1.25] text-foreground">
                  {{ it.title }}
                </h3>

                <span
                  class="mt-5 inline-flex min-h-11 items-center justify-center self-start rounded-lg border border-border bg-background px-4 py-2.5 text-body-s-bold text-foreground transition group-hover:border-primary/25 group-hover:text-primary"
                >
                  Ver categoría
                </span>
              </div>
            </NuxtLink>
          </div>
        </section>
      </div>
    </section>
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
