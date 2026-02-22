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

const hasDropdown = (c: CategoriaNode) =>
  (c?.children?.length ?? 0) > 0 || (c?.products?.length ?? 0) > 0;
</script>

<template>
  <nav
    class="hidden md:block w-full bg-[#004F78]"
    role="navigation"
    aria-label="Categories"
  >
    <!-- min-w-0 IMPORTANTE para que el hijo con overflow-x-auto no ensanche la página -->
    <div
      class="mx-auto w-full max-w-[1440px] min-w-0 px-4 sm:px-6 lg:px-10 xl:px-[80px] min-h-[36px] py-2 flex items-center"
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

      <!-- Wrapper con scroll horizontal CONTROLADO -->
      <div
        v-else
        class="w-full min-w-0 max-w-full overflow-x-auto overflow-y-visible overscroll-x-contain no-scrollbar"
      >
        <Menubar
          class="inline-flex w-max min-w-full max-w-none items-center whitespace-nowrap !bg-transparent !border-0 !shadow-none !p-0 gap-4 md:gap-6 lg:gap-8 xl:gap-[47px]"
        >
          <MenubarMenu
            v-for="cat in categories"
            :key="cat.id || cat.slug || cat.path || cat.title"
            class="shrink-0"
          >
            <template v-if="hasDropdown(cat)">
              <MenubarTrigger as-child>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 whitespace-nowrap text-[14px] leading-[20px] font-normal text-white hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#004F78]"
                  :aria-label="`Obrir submenú de ${labelOf(cat)}`"
                >
                  <span>{{ labelOf(cat) }}</span>
                  <ChevronDownIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              </MenubarTrigger>

              <MenubarContent
                class="z-50 w-[min(920px,calc(100vw-2rem))] max-h-[min(80vh,720px)] overflow-y-auto p-4 sm:p-6"
                align="start"
              >
                <template v-if="cat.children?.length">
                  <div
                    class="grid gap-6 sm:gap-8 lg:gap-12 grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
                  >
                    <div v-for="sub in cat.children" :key="sub.slug" class="min-w-0">
                      <NuxtLink
                        :to="sub.path || `/categorias/${sub.slug}`"
                        class="flex items-center gap-2 border-b pb-2 mb-4 hover:opacity-80 transition-opacity"
                      >
                        <NuxtImg
                          v-if="(sub as any).image || (sub as any).imageSrc"
                          :src="(sub as any).image || (sub as any).imageSrc"
                          :alt="sub.title || ''"
                          class="h-8 w-8 shrink-0 rounded object-cover border border-border"
                          loading="lazy"
                        />
                        <span
                          class="text-base font-semibold uppercase tracking-wide text-foreground"
                        >
                          {{ sub.nav || sub.title || sub.slug }}
                        </span>
                      </NuxtLink>

                      <div class="flex flex-col gap-1">
                        <MenubarItem
                          v-for="prod in sub.products || []"
                          :key="prod.slug"
                          as-child
                        >
                          <NuxtLink
                            :to="prod.path || `/productos/${prod.slug}`"
                            class="flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-2 hover:bg-muted cursor-pointer"
                          >
                            <NuxtImg
                              v-if="(prod as any).image || (prod as any).imageSrc"
                              :src="(prod as any).image || (prod as any).imageSrc"
                              :alt="prod.title || ''"
                              class="h-8 w-8 shrink-0 rounded object-cover border border-border"
                              loading="lazy"
                            />
                            <span class="text-sm truncate">{{ prod.title }}</span>
                          </NuxtLink>
                        </MenubarItem>

                        <MenubarItem v-if="(sub.products?.length ?? 0) === 0" disabled>
                          <span class="text-sm text-muted-foreground">
                            (Sense productes)
                          </span>
                        </MenubarItem>
                      </div>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <div class="flex flex-col gap-6">
                    <div class="flex items-center justify-between gap-4 border-b pb-2">
                      <h3 class="text-lg font-semibold text-foreground min-w-0 truncate">
                        {{ labelOf(cat) }}
                      </h3>
                      <NuxtLink
                        :to="toOf(cat)"
                        class="shrink-0 text-sm font-medium text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                      >
                        Ver todo &rarr;
                      </NuxtLink>
                    </div>

                    <div
                      class="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                    >
                      <MenubarItem
                        v-for="prod in cat.products || []"
                        :key="prod.slug"
                        as-child
                      >
                        <NuxtLink
                          :to="prod.path || `/productos/${prod.slug}`"
                          class="group flex flex-col gap-2 rounded-md hover:bg-muted p-2 cursor-pointer min-w-0"
                        >
                          <div
                            class="aspect-square w-full overflow-hidden rounded-md border border-border bg-muted/30"
                          >
                            <NuxtImg
                              v-if="(prod as any).image || (prod as any).imageSrc"
                              :src="(prod as any).image || (prod as any).imageSrc"
                              :alt="prod.title || ''"
                              class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div
                              v-else
                              class="h-full w-full flex items-center justify-center text-xs text-muted-foreground"
                            >
                              Sin foto
                            </div>
                          </div>
                          <span
                            class="text-sm font-medium line-clamp-2 text-center leading-tight"
                          >
                            {{ prod.title }}
                          </span>
                        </NuxtLink>
                      </MenubarItem>
                    </div>
                  </div>
                </template>
              </MenubarContent>
            </template>

            <template v-else>
              <NuxtLink
                :to="toOf(cat)"
                class="shrink-0 whitespace-nowrap text-[14px] leading-[20px] font-normal text-white hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#004F78]"
              >
                {{ labelOf(cat) }}
              </NuxtLink>
            </template>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Oculta scrollbar sin romper scroll */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
