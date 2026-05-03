<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Search, X } from "lucide-vue-next";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

type SuggestItem = {
  id: string;
  kind: "producto" | "categoria";
  title: string;
  href: string;
  image?: string | null;
};

const props = withDefaults(defineProps<{ limit?: number }>(), {
  limit: 8,
});

const router = useRouter();

const open = ref(false);
const q = ref("");
const debounced = ref("");
let t: ReturnType<typeof setTimeout> | null = null;

const items = ref<SuggestItem[]>([]);
const pending = ref(false);

watch(q, (v) => {
  if (t) clearTimeout(t);
  t = setTimeout(() => {
    debounced.value = v.trim();
  }, 180);
});

watch(
  () => debounced.value,
  async (term) => {
    if (!term) {
      items.value = [];
      open.value = false;
      return;
    }

    open.value = true;
    pending.value = true;

    try {
      const res = await $fetch<{ items: SuggestItem[] }>("/api/search/results", {
        query: {
          q: term,
          limit: props.limit,
          ...(import.meta.dev ? { force: "1" } : {}),
        },
      });

      items.value = res.items ?? [];
    } catch {
      items.value = [];
    } finally {
      pending.value = false;
    }
  }
);

const products = computed(() => items.value.filter((i) => i.kind === "producto"));
const categories = computed(() => items.value.filter((i) => i.kind === "categoria"));

function goSearch() {
  const term = q.value.trim();
  if (!term) return;

  open.value = false;
  router.push({ path: "/buscar", query: { q: term } });
}

function pick(it: SuggestItem) {
  open.value = false;
  router.push(it.href);
}

function clear() {
  q.value = "";
  debounced.value = "";
  items.value = [];
  open.value = false;
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <div class="w-full max-w-[556px]">
        <form role="search" @submit.prevent="goSearch">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#959595]"
            />

            <Input
              v-model="q"
              type="text"
              inputmode="search"
              autocomplete="off"
              spellcheck="false"
              enterkeyhint="search"
              placeholder="Buscar en la web"
              aria-label="Buscar en la web"
              class="h-8 rounded-lg border border-[#959595] bg-white py-[5px] pl-10 pr-10 text-base font-normal leading-[22px] shadow-none placeholder:text-[#959595] focus-visible:ring-0 focus-visible:ring-offset-0"
              @focus="open = !!q.trim()"
              @keydown.esc.prevent="open = false"
            />

            <Button
              v-if="q"
              type="button"
              variant="ghost"
              class="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-md p-0 text-[#959595] hover:bg-muted hover:text-foreground"
              aria-label="Borrar búsqueda"
              @click.stop="clear"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </PopoverTrigger>

    <PopoverContent
      align="center"
      class="w-[min(calc(100vw-2rem),556px)] overflow-hidden rounded-2xl border-border/70 p-0 shadow-xl"
      :side-offset="8"
    >
      <div class="p-3">
        <div v-if="pending" class="px-2 py-2 text-sm text-muted-foreground">
          Buscando…
        </div>

        <div
          v-else-if="items.length === 0"
          class="px-2 py-2 text-sm text-muted-foreground"
        >
          No hay resultados.
        </div>

        <div v-else class="space-y-3">
          <div v-if="products.length">
            <div class="px-1 pb-2 text-xs font-medium text-muted-foreground">
              Productos
            </div>

            <button
              v-for="it in products"
              :key="it.id"
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted"
              @click="pick(it)"
            >
              <div class="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                <img
                  v-if="it.image"
                  :src="it.image"
                  class="h-10 w-10 object-cover"
                  alt=""
                  loading="lazy"
                />
              </div>

              <div class="min-w-0 flex-1 text-sm leading-5 text-foreground">
                {{ it.title }}
              </div>
            </button>
          </div>

          <div v-if="categories.length">
            <div class="px-1 pb-2 text-xs font-medium text-muted-foreground">
              Categorías
            </div>

            <button
              v-for="it in categories"
              :key="it.id"
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted"
              @click="pick(it)"
            >
              <div class="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                <img
                  v-if="it.image"
                  :src="it.image"
                  class="h-10 w-10 object-cover"
                  alt=""
                  loading="lazy"
                />
              </div>

              <div class="min-w-0 flex-1 text-sm leading-5 text-foreground">
                {{ it.title }}
              </div>
            </button>
          </div>

          <Separator />

          <Button
            type="button"
            variant="ghost"
            class="w-full justify-start rounded-xl text-primary hover:bg-primary/5 hover:text-primary"
            @click="goSearch"
          >
            Ver todos los resultados para “{{ q.trim() }}”
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
