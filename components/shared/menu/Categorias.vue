<!-- components/shared/menu/Categorias.vue -->
<script setup lang="ts">
import { computed } from "vue";
import type { CategoriaNode } from "~/composables/useCategoriasNav";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { ChevronDownIcon } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    tree?: CategoriaNode[];
    pending?: boolean;
    error?: unknown;
  }>(),
  {
    tree: () => [],
    pending: false,
    error: null,
  }
);

const categories = computed(() => props.tree ?? []);

const labelOf = (c: CategoriaNode) => c?.nav || c?.title || c?.slug || "";
const toOf = (c: CategoriaNode) =>
  c?.path || (c?.slug ? `/categorias/${c.slug}` : "/categorias");
</script>

<template>
  <nav
    class="hidden md:block w-full bg-[#004F78]"
    role="navigation"
    aria-label="Categories"
  >
    <div
      class="mx-auto w-full max-w-[1440px] h-[36px] px-[80px] py-[8px] flex items-center"
    >
      <div v-if="pending" class="text-[14px] leading-[20px] text-white/80">
        Carregant…
      </div>
      <div v-else-if="error" class="text-[14px] leading-[20px] text-white">
        No s’ha pogut carregar el menú.
      </div>
      <div
        v-else-if="!categories.length"
        class="text-[14px] leading-[20px] text-white/80"
      >
        (Sense categories)
      </div>

      <Menubar
        v-else
        class="w-full !h-[20px] !p-0 !bg-transparent !border-0 !shadow-none flex items-center justify-start gap-[47px]"
      >
        <MenubarMenu
          v-for="cat in categories"
          :key="cat.id || cat.slug || cat.path || cat.title"
          class="shrink-0"
        >
          <template v-if="cat.children?.length || cat.products?.length">
            <MenubarTrigger as-child>
              <button
                type="button"
                class="inline-flex items-center gap-1 whitespace-nowrap text-[14px] leading-[20px] font-normal text-white hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#004F78]"
                :aria-label="`Obrir submenú de ${labelOf(cat)}`"
              >
                <span>{{ labelOf(cat) }}</span>
                <ChevronDownIcon class="h-4 w-4" aria-hidden="true" />
              </button>
            </MenubarTrigger>

            <MenubarContent class="z-50 w-[920px] p-4" align="start">
              <template v-if="cat.children?.length">
                <div class="grid grid-cols-4 gap-6">
                  <div v-for="sub in cat.children" :key="sub.slug" class="min-w-0">
                    <NuxtLink
                      :to="sub.path || `/categorias/${sub.slug}`"
                      class="flex items-center gap-2 rounded-md px-2 py-2 text-[12px] uppercase tracking-wide text-muted-foreground hover:bg-muted hover:underline"
                    >
                      <NuxtImg
                        v-if="sub.image"
                        :src="sub.image"
                        :alt="sub.title || ''"
                        width="24"
                        height="24"
                        class="h-6 w-6 shrink-0 rounded object-cover border border-border"
                        loading="lazy"
                      />
                      <span class="truncate">{{ sub.nav || sub.title || sub.slug }}</span>
                    </NuxtLink>

                    <div class="mt-2 flex flex-col">
                      <MenubarItem
                        v-for="prod in sub.products || []"
                        :key="prod.slug"
                        as-child
                      >
                        <NuxtLink
                          :to="prod.path || `/productos/${prod.slug}`"
                          class="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-muted"
                        >
                          <NuxtImg
                            v-if="prod.image"
                            :src="prod.image"
                            :alt="prod.title || ''"
                            width="24"
                            height="24"
                            class="h-6 w-6 shrink-0 rounded object-cover border border-border"
                            loading="lazy"
                          />
                          <span class="text-sm truncate">{{ prod.title }}</span>
                        </NuxtLink>
                      </MenubarItem>

                      <MenubarItem v-if="(sub.products?.length ?? 0) === 0" disabled>
                        (Sense productes)
                      </MenubarItem>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="grid grid-cols-2 gap-2">
                  <MenubarItem
                    v-for="prod in cat.products || []"
                    :key="prod.slug"
                    as-child
                  >
                    <NuxtLink :to="prod.path || `/productos/${prod.slug}`" class="w-full">
                      {{ prod.title }}
                    </NuxtLink>
                  </MenubarItem>
                </div>
              </template>
            </MenubarContent>
          </template>

          <template v-else>
            <NuxtLink
              :to="toOf(cat)"
              class="whitespace-nowrap text-[14px] leading-[20px] font-normal text-white hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#004F78]"
            >
              {{ labelOf(cat) }}
            </NuxtLink>
          </template>
        </MenubarMenu>
      </Menubar>
    </div>
  </nav>
</template>
