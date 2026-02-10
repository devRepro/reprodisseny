<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  if (!term) return;
  router.push({ path: "/buscar", query: { q: term } });
}

const { data, pending, error } = await useAsyncData(
  () => `search:${q.value}`,
  () => {
    if (!q.value) return Promise.resolve({ q: "", items: [] as SuggestItem[] });
    return $fetch<{ q: string; items: SuggestItem[] }>("/api/search/suggest", {
      query: { q: q.value, limit: 30, force: "1" }, // force opcional en dev
    });
  },
  { watch: [q] }
);

useHead({
  meta: [{ name: "robots", content: "noindex, follow" }],
});

const items = computed(() => data.value?.items ?? []);
const products = computed(() => items.value.filter((i) => i.kind === "producto"));
const categories = computed(() => items.value.filter((i) => i.kind === "categoria"));
</script>

<template>
  <main class="mx-auto max-w-7xl px-6 py-10">
    <header class="flex flex-col gap-4">
      <h1 class="text-2xl font-semibold">Buscar</h1>

      <form class="flex gap-2 max-w-2xl" role="search" @submit.prevent="submit">
        <div class="relative w-full">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          />
          <Input
            v-model="localQ"
            class="pl-10"
            type="search"
            placeholder="Buscar productos o categorías"
          />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      <p v-if="q" class="text-sm text-muted-foreground">
        Resultados para: <span class="font-medium text-foreground">“{{ q }}”</span>
      </p>
    </header>

    <section class="mt-8">
      <div v-if="!q" class="text-sm text-muted-foreground">
        Escribe una búsqueda para ver resultados.
      </div>

      <div v-else-if="pending" class="text-sm text-muted-foreground">Buscando…</div>

      <div v-else-if="error" class="text-sm text-destructive">
        No se ha podido cargar la búsqueda.
      </div>

      <div v-else-if="items.length === 0" class="text-sm text-muted-foreground">
        No hay resultados para mostrar.
      </div>

      <div v-else class="space-y-10">
        <div v-if="products.length">
          <h2 class="text-lg font-semibold mb-4">Productos ({{ products.length }})</h2>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NuxtLink
              v-for="it in products"
              :key="it.id"
              :to="it.href"
              class="rounded-xl border bg-white p-4 hover:bg-muted/30 transition flex gap-3"
            >
              <div class="h-12 w-12 rounded bg-muted overflow-hidden shrink-0">
                <NuxtImg
                  v-if="it.image"
                  :src="it.image"
                  width="48"
                  height="48"
                  class="h-12 w-12 object-cover"
                  alt=""
                />
              </div>

              <div class="min-w-0">
                <div class="text-sm font-medium truncate">{{ it.title }}</div>
                <div class="text-xs text-muted-foreground">Producto</div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <div v-if="categories.length">
          <h2 class="text-lg font-semibold mb-4">Categorías ({{ categories.length }})</h2>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NuxtLink
              v-for="it in categories"
              :key="it.id"
              :to="it.href"
              class="rounded-xl border bg-white p-4 hover:bg-muted/30 transition flex gap-3"
            >
              <div class="h-12 w-12 rounded bg-muted overflow-hidden shrink-0">
                <NuxtImg
                  v-if="it.image"
                  :src="it.image"
                  width="48"
                  height="48"
                  class="h-12 w-12 object-cover"
                  alt=""
                />
              </div>

              <div class="min-w-0">
                <div class="text-sm font-medium truncate">{{ it.title }}</div>
                <div class="text-xs text-muted-foreground">Categoría</div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
