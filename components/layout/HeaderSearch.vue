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
let t: any = null;

const items = ref<SuggestItem[]>([]);
const pending = ref(false);

watch(q, (v) => {
  clearTimeout(t);
  t = setTimeout(() => (debounced.value = v.trim()), 180);
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
      const res = await $fetch<{ items: SuggestItem[] }>("/api/search/suggest", {
        query: {
          q: term,
          limit: props.limit,
          ...(import.meta.dev ? { force: "1" } : {}),
        },
      });
      items.value = res.items ?? [];
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
      <!-- ✅ Trigger estable: un div -->
      <div class="w-full max-w-[556px]">
        <form role="search" @submit.prevent="goSearch">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#959595]"
            />

            <Input
              v-model="q"
              type="search"
              placeholder="Buscar"
              aria-label="Buscar"
              class="h-8 rounded-lg border border-[#959595] bg-white pl-10 pr-10 py-[5px] text-base leading-[22px] font-normal shadow-none placeholder:text-[#959595] focus-visible:ring-0 focus-visible:ring-offset-0"
              @focus="open = !!q.trim()"
              @keydown.esc.prevent="open = false"
            />

            <Button
              v-if="q"
              type="button"
              variant="ghost"
              class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-md"
              aria-label="Borrar búsqueda"
              @click="clear"
            >
              <X class="h-5 w-5 text-[#959595]" />
            </Button>
          </div>
        </form>
      </div>
    </PopoverTrigger>

    <PopoverContent align="center" class="w-[556px] p-0" :side-offset="8">
      <div class="p-3">
        <div v-if="pending" class="text-sm text-muted-foreground">Buscando…</div>

        <div v-else-if="items.length === 0" class="text-sm text-muted-foreground">
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
              class="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted text-left"
              @click="pick(it)"
            >
              <div class="h-10 w-10 rounded bg-muted overflow-hidden shrink-0">
                <img
                  v-if="it.image"
                  :src="it.image"
                  class="h-10 w-10 object-cover"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div class="text-sm">{{ it.title }}</div>
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
              class="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted text-left"
              @click="pick(it)"
            >
              <div class="h-10 w-10 rounded bg-muted overflow-hidden shrink-0">
                <img
                  v-if="it.image"
                  :src="it.image"
                  class="h-10 w-10 object-cover"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div class="text-sm">{{ it.title }}</div>
            </button>
          </div>

          <Separator />

          <Button
            type="button"
            variant="ghost"
            class="w-full justify-start"
            @click="goSearch"
          >
            Más resultados
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
