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
import CmsImage from "@/components/shared/blocks/CmsImage.vue";

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

const labelOf = (category: Partial<CategoriaNode> | null | undefined) =>
  category?.nav || category?.title || category?.slug || "";

const nodeKeyOf = (category: Partial<CategoriaNode> | null | undefined) =>
  category?.path || category?.slug || category?.id || category?.title || "";

const toCat = (category: Partial<CategoriaNode> | null | undefined) =>
  categoryHref(category);

const toProd = (product: any) =>
  product?.path || (product?.slug ? `/productos/${product.slug}` : "/productos");

const productLabelOf = (product: any) =>
  product?.title || product?.nav || product?.slug || "Producto";

const childrenOf = (category: CategoriaNode | null | undefined) =>
  Array.isArray(category?.children) ? category.children : [];

const previewProducts = (category: CategoriaNode | null | undefined) =>
  Array.isArray(category?.products) ? category.products.slice(0, 6) : [];

const hasChildren = (category: CategoriaNode | null | undefined) =>
  childrenOf(category).length > 0;

const hasPreviewProducts = (category: CategoriaNode | null | undefined) =>
  previewProducts(category).length > 0;

const hasDropdown = (category: CategoriaNode) =>
  hasChildren(category) || hasPreviewProducts(category);

const imageSrcOf = (item: any) => {
  if (!item) return "";

  if (typeof item.image === "string") {
    return item.image;
  }

  return item.image?.src || item.imageSrc || "";
};

const isCategoryActive = (category: Partial<CategoriaNode> | null | undefined) => {
  const href = toCat(category);
  if (!href) return false;

  return route.path === href || route.path.startsWith(`${href}/`);
};

const menuContentClass = (category: CategoriaNode) => [
  "z-50 max-h-[min(78vh,680px)] overflow-y-auto rounded-2xl border border-border/70 bg-popover p-0 text-popover-foreground shadow-xl",
  hasChildren(category)
    ? "w-[min(940px,calc(100vw-2rem))]"
    : "w-[min(540px,calc(100vw-2rem))]",
];

const menuInnerClass = (category: CategoriaNode) =>
  hasChildren(category) ? "grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:gap-6" : "p-5";
</script>

<template>
  <nav class="w-full bg-[#004F78]" aria-label="Categorías">
    <div
      class="mx-auto w-full max-w-[1440px] min-w-0 px-4 py-2 sm:px-6 lg:px-10 xl:px-[80px]"
    >
      <div
        v-if="!hasCategories"
        class="text-center text-[14px] leading-[20px] text-white/80 md:text-left"
      >
        <span v-if="pending">Cargando…</span>
        <span v-else-if="error">No se ha podido cargar el menú.</span>
        <span v-else>(Sin categorías)</span>
      </div>

      <template v-else>
        <div class="sr-only" aria-live="polite">
          <span v-if="pending">Actualizando categorías</span>
        </div>

        <!-- Mobile -->
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

        <!-- Desktop -->
        <div class="hidden w-full min-w-0 md:flex md:justify-center">
          <Menubar
            class="flex flex-wrap w-full max-w-fit items-center justify-center gap-4 !border-0 !bg-transparent !p-0 !shadow-none lg:gap-6 xl:gap-8"
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
                      class="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#004F78] data-[state=open]:bg-white/15"
                      :aria-label="`Abrir submenú de ${labelOf(cat)}`"
                    >
                      <ChevronDownIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
                    </button>
                  </MenubarTrigger>
                </div>

                <MenubarContent align="center" :class="menuContentClass(cat)">
                  <!-- Categoría con subcategorías -->
                  <template v-if="hasChildren(cat)">
                    <div :class="menuInnerClass(cat)">
                      <section
                        v-for="sub in childrenOf(cat)"
                        :key="nodeKeyOf(sub)"
                        class="min-w-0 rounded-xl border border-border/40 bg-background/60 p-4"
                      >
                        <NuxtLink
                          :to="toCat(sub)"
                          class="mb-3 flex items-center gap-3 border-b border-border/50 pb-3 transition-opacity hover:opacity-90"
                        >
                          <CmsImage
                            v-if="imageSrcOf(sub)"
                            :src="imageSrcOf(sub)"
                            alt=""
                            aria-hidden="true"
                            width="36"
                            height="36"
                            class="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
                          />

                          <span
                            class="min-w-0 truncate text-sm font-bold uppercase tracking-[0.08em] text-foreground"
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
                              class="flex min-w-0 w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                            >
                              <CmsImage
                                v-if="imageSrcOf(prod)"
                                :src="imageSrcOf(prod)"
                                alt=""
                                aria-hidden="true"
                                width="32"
                                height="32"
                                class="h-8 w-8 shrink-0 rounded-full border border-border object-cover"
                              />

                              <span class="min-w-0 truncate text-foreground/88">
                                {{ productLabelOf(prod) }}
                              </span>
                            </NuxtLink>
                          </MenubarItem>

                          <MenubarItem as-child>
                            <NuxtLink
                              :to="toCat(sub)"
                              class="mt-3 inline-flex w-fit cursor-pointer items-center text-sm font-semibold text-primary hover:underline"
                            >
                              Ver subcategoría →
                            </NuxtLink>
                          </MenubarItem>
                        </div>

                        <div
                          v-else
                          class="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
                        >
                          Sin productos destacados
                        </div>
                      </section>
                    </div>
                  </template>

                  <!-- Categoría sin subcategorías pero con productos directos -->
                  <template v-else-if="hasPreviewProducts(cat)">
                    <div :class="menuInnerClass(cat)">
                      <NuxtLink
                        :to="toCat(cat)"
                        class="mb-3 flex items-center gap-3 border-b border-border/50 pb-3 transition-opacity hover:opacity-90"
                      >
                        <CmsImage
                          v-if="imageSrcOf(cat)"
                          :src="imageSrcOf(cat)"
                          alt=""
                          aria-hidden="true"
                          width="36"
                          height="36"
                          class="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
                        />

                        <span
                          class="min-w-0 truncate text-sm font-bold uppercase tracking-[0.08em] text-foreground"
                        >
                          {{ labelOf(cat) }}
                        </span>
                      </NuxtLink>

                      <div class="grid gap-1">
                        <MenubarItem
                          v-for="prod in previewProducts(cat)"
                          :key="prod.path || prod.slug || prod.title"
                          as-child
                        >
                          <NuxtLink
                            :to="toProd(prod)"
                            :prefetch="false"
                            class="flex min-w-0 w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          >
                            <CmsImage
                              v-if="imageSrcOf(prod)"
                              :src="imageSrcOf(prod)"
                              alt=""
                              aria-hidden="true"
                              width="32"
                              height="32"
                              class="h-8 w-8 shrink-0 rounded-full border border-border object-cover"
                            />

                            <span class="min-w-0 truncate text-foreground/88">
                              {{ productLabelOf(prod) }}
                            </span>
                          </NuxtLink>
                        </MenubarItem>

                        <MenubarItem as-child>
                          <NuxtLink
                            :to="toCat(cat)"
                            class="mt-3 inline-flex w-fit cursor-pointer items-center text-sm font-semibold text-primary hover:underline"
                          >
                            Ver categoría →
                          </NuxtLink>
                        </MenubarItem>
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
