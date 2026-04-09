<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "#imports";
import type { CategoriaNode } from "~/composables/useCategoriasNav";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { ChevronDownIcon } from "lucide-vue-next";
import { categoryHref } from "@/utils/categoryHref";

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

const route = useRoute();

const categories = computed<CategoriaNode[]>(() =>
  Array.isArray(props.tree) ? props.tree : []
);

const hasCategories = computed(() => categories.value.length > 0);

const labelOf = (c: Partial<CategoriaNode> | null | undefined) =>
  c?.nav || c?.title || c?.slug || "";

const nodeKeyOf = (c: Partial<CategoriaNode> | null | undefined) =>
  c?.path || c?.slug || c?.id || c?.title || "";

const toCat = (c: Partial<CategoriaNode> | null | undefined) => categoryHref(c);

const toProd = (p: any) => p?.path || (p?.slug ? `/productos/${p.slug}` : "/productos");

const childrenOf = (c: CategoriaNode | null | undefined) =>
  Array.isArray(c?.children) ? c.children : [];

const previewProducts = (c: CategoriaNode | null | undefined) =>
  Array.isArray(c?.products) ? c.products.slice(0, 8) : [];

const hasChildren = (c: CategoriaNode | null | undefined) => childrenOf(c).length > 0;

const hasPreviewProducts = (c: CategoriaNode | null | undefined) =>
  previewProducts(c).length > 0;

const hasDropdown = (c: CategoriaNode) => hasChildren(c) || hasPreviewProducts(c);

const imageSrcOf = (item: any) => item?.image?.src || item?.imageSrc || "";

const imageAltOf = (item: any) =>
  item?.image?.alt || item?.title || item?.nav || item?.slug || "";

const isCategoryActive = (c: Partial<CategoriaNode> | null | undefined) => {
  const href = toCat(c);
  if (!href) return false;
  return route.path === href || route.path.startsWith(`${href}/`);
};
</script>

<template>
  <nav class="w-full bg-[#004F78]" aria-label="Categorías">
    <div
      class="mx-auto w-full max-w-[1440px] min-w-0 px-4 py-2 sm:px-6 lg:px-10 xl:px-[80px]"
    >
      <div
        v-if="!hasCategories"
        class="text-[14px] leading-[20px] text-white/80 text-center md:text-left"
      >
        <span v-if="pending">Cargando…</span>
        <span v-else-if="error">No se ha podido cargar el menú.</span>
        <span v-else>(Sin categorías)</span>
      </div>

      <template v-else>
        <div class="sr-only" aria-live="polite">
          <span v-if="pending">Actualizando categorías</span>
        </div>

        <div class="relative min-w-0 md:hidden">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#004F78] to-transparent"
          />
          <div
            class="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#004F78] to-transparent"
          />

          <div
            class="no-scrollbar flex items-center gap-2 overflow-x-auto overscroll-x-contain pr-4"
          >
            <NuxtLink
              v-for="cat in categories"
              :key="nodeKeyOf(cat)"
              :to="toCat(cat)"
              class="shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              :class="
                isCategoryActive(cat)
                  ? 'border-white/30 bg-white text-[#004F78]'
                  : 'border-white/20 bg-white/10 text-white hover:bg-white/15'
              "
            >
              {{ labelOf(cat) }}
            </NuxtLink>
          </div>
        </div>

        <div class="hidden w-full min-w-0 md:flex md:justify-center">
          <Menubar
            class="flex flex-wrap w-full max-w-fit justify-center items-center gap-4 !border-0 !bg-transparent !p-0 !shadow-none lg:gap-6 xl:gap-8"
          >
            <MenubarMenu v-for="cat in categories" :key="nodeKeyOf(cat)" class="shrink-0">
              <template v-if="hasDropdown(cat)">
                <div class="inline-flex items-center gap-1">
                  <NuxtLink
                    :to="toCat(cat)"
                    class="shrink-0 whitespace-nowrap text-[14px] leading-[20px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#004F78]"
                    :class="
                      isCategoryActive(cat)
                        ? 'font-semibold text-white'
                        : 'font-normal text-white hover:text-white/90'
                    "
                  >
                    {{ labelOf(cat) }}
                  </NuxtLink>

                  <MenubarTrigger as-child>
                    <button
                      type="button"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#004F78]"
                      :aria-label="`Abrir submenú de ${labelOf(cat)}`"
                    >
                      <ChevronDownIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
                    </button>
                  </MenubarTrigger>
                </div>

                <MenubarContent
                  align="center"
                  class="z-50 max-h-[min(80vh,720px)] w-[min(920px,calc(100vw-2rem))] overflow-y-auto p-4 sm:p-6"
                >
                  <template v-if="hasChildren(cat)">
                    <div
                      class="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:gap-12"
                    >
                      <div
                        v-for="sub in childrenOf(cat)"
                        :key="nodeKeyOf(sub)"
                        class="min-w-0"
                      >
                        <NuxtLink
                          :to="toCat(sub)"
                          class="mb-4 flex items-center gap-3 border-b pb-2 transition-opacity hover:opacity-80"
                        >
                          <NuxtImg
                            v-if="imageSrcOf(sub)"
                            :src="imageSrcOf(sub)"
                            :alt="imageAltOf(sub)"
                            class="h-10 w-10 shrink-0 rounded-full border border-border object-cover"
                            loading="lazy"
                          />
                          <span
                            class="text-base font-semibold uppercase tracking-wide text-foreground"
                          >
                            {{ labelOf(sub) }}
                          </span>
                        </NuxtLink>

                        <div v-if="hasPreviewProducts(sub)" class="flex flex-col gap-1">
                          <MenubarItem
                            v-for="prod in previewProducts(sub)"
                            :key="prod.path || prod.slug || prod.title"
                            as-child
                          >
                            <NuxtLink
                              :to="toProd(prod)"
                              :prefetch="false"
                              class="flex min-w-0 w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"
                            >
                              <NuxtImg
                                v-if="imageSrcOf(prod)"
                                :src="imageSrcOf(prod)"
                                :alt="imageAltOf(prod)"
                                class="h-8 w-8 shrink-0 rounded-full border border-border object-cover"
                                loading="lazy"
                              />
                              <span class="truncate text-sm">{{ prod.title }}</span>
                            </NuxtLink>
                          </MenubarItem>

                          <NuxtLink
                            :to="toCat(sub)"
                            class="mt-2 inline-flex text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Ver subcategoría →
                          </NuxtLink>
                        </div>

                        <div v-else class="flex flex-col gap-2">
                          <p class="text-sm text-muted-foreground">
                            Sin productos destacados
                          </p>
                          <NuxtLink
                            :to="toCat(sub)"
                            class="inline-flex text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Ver subcategoría →
                          </NuxtLink>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <div class="flex flex-col gap-6">
                      <div class="flex items-center justify-between gap-4 border-b pb-2">
                        <h3
                          class="min-w-0 truncate text-lg font-semibold text-foreground"
                        >
                          {{ labelOf(cat) }}
                        </h3>
                        <NuxtLink
                          :to="toCat(cat)"
                          class="shrink-0 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                        >
                          Ver todo →
                        </NuxtLink>
                      </div>

                      <div
                        v-if="hasPreviewProducts(cat)"
                        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                      >
                        <MenubarItem
                          v-for="prod in previewProducts(cat)"
                          :key="prod.path || prod.slug || prod.title"
                          as-child
                        >
                          <NuxtLink
                            :to="toProd(prod)"
                            :prefetch="false"
                            class="group flex min-w-0 cursor-pointer flex-col items-center gap-2 rounded-md p-2 hover:bg-muted"
                          >
                            <div
                              class="aspect-square w-full max-w-[100px] overflow-hidden rounded-full border border-border bg-muted/30"
                            >
                              <NuxtImg
                                v-if="imageSrcOf(prod)"
                                :src="imageSrcOf(prod)"
                                :alt="imageAltOf(prod)"
                                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                              <div
                                v-else
                                class="flex h-full w-full items-center justify-center text-xs text-muted-foreground"
                              >
                                Sin foto
                              </div>
                            </div>
                            <span
                              class="line-clamp-2 text-center text-sm font-medium leading-tight"
                            >
                              {{ prod.title }}
                            </span>
                          </NuxtLink>
                        </MenubarItem>
                      </div>

                      <div v-else class="flex flex-col gap-2">
                        <p class="text-sm text-muted-foreground">
                          Sin productos destacados
                        </p>
                        <NuxtLink
                          :to="toCat(cat)"
                          class="inline-flex text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                        >
                          Ver todo →
                        </NuxtLink>
                      </div>
                    </div>
                  </template>
                </MenubarContent>
              </template>

              <template v-else>
                <NuxtLink
                  :to="toCat(cat)"
                  class="shrink-0 whitespace-nowrap text-[14px] leading-[20px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#004F78]"
                  :class="
                    isCategoryActive(cat)
                      ? 'font-semibold text-white'
                      : 'font-normal text-white hover:text-white/90'
                  "
                >
                  {{ labelOf(cat) }}
                </NuxtLink>
              </template>
            </MenubarMenu>
          </Menubar>
        </div>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
