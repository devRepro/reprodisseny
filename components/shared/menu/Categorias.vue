<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  type ComponentPublicInstance,
  watch,
} from "vue";
import { useRoute } from "#imports";
import type { CategoriaNode } from "~/composables/useCategoriasNav";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
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

const desktopMenu = ref<HTMLElement | null>(null);
const desktopMeasurements = ref<HTMLElement[]>([]);
const moreMeasurement = ref<HTMLElement | null>(null);
const directCategoryCount = ref(5);
let menuResizeObserver: ResizeObserver | null = null;

const directCategories = computed(() =>
  categories.value.slice(0, directCategoryCount.value)
);

const overflowCategories = computed(() =>
  categories.value.slice(directCategoryCount.value)
);

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

const isCategoryActive = (
  category: Partial<CategoriaNode> | null | undefined
) => {
  const href = toCat(category);
  if (!href) return false;

  return route.path === href || route.path.startsWith(`${href}/`);
};

const isMoreActive = computed(() =>
  overflowCategories.value.some(isCategoryActive)
);

const setDesktopMeasurement = (
  element: Element | ComponentPublicInstance | null,
  index: number
) => {
  if (element instanceof HTMLElement) {
    desktopMeasurements.value[index] = element;
  }
};

const updateDirectCategoryCount = () => {
  const menuWidth = desktopMenu.value?.clientWidth ?? 0;
  const itemWidths = categories.value.map(
    (_, index) => desktopMeasurements.value[index]?.offsetWidth ?? 0
  );
  const moreWidth = moreMeasurement.value?.offsetWidth ?? 0;

  if (!menuWidth || itemWidths.some((width) => !width) || !moreWidth) return;

  const gap = window.matchMedia("(min-width: 1536px)").matches ? 16 : 8;
  const allItemsWidth =
    itemWidths.reduce((total, width) => total + width, 0) +
    gap * Math.max(0, itemWidths.length - 1);

  if (allItemsWidth <= menuWidth) {
    directCategoryCount.value = categories.value.length;
    return;
  }

  let usedWidth = moreWidth;
  let count = 0;

  for (const itemWidth of itemWidths) {
    const nextWidth = usedWidth + gap + itemWidth;
    if (nextWidth > menuWidth) break;
    usedWidth = nextWidth;
    count += 1;
  }

  directCategoryCount.value = count;
};

const scheduleDesktopMeasurement = () => {
  nextTick(updateDirectCategoryCount);
};

onMounted(() => {
  menuResizeObserver = new ResizeObserver(scheduleDesktopMeasurement);
  if (desktopMenu.value) menuResizeObserver.observe(desktopMenu.value);

  scheduleDesktopMeasurement();
  document.fonts?.ready.then(scheduleDesktopMeasurement);
});

onBeforeUnmount(() => {
  menuResizeObserver?.disconnect();
});

watch(categories, () => {
  directCategoryCount.value = Math.min(5, categories.value.length);
  desktopMeasurements.value = [];
  scheduleDesktopMeasurement();
});

const menuContentClass = (category: CategoriaNode) => [
  "z-50 max-h-[min(78vh,680px)] overflow-y-auto rounded-2xl border border-border/70 bg-popover p-0 text-popover-foreground shadow-xl",
  hasChildren(category)
    ? "w-[min(940px,calc(100vw-2rem))]"
    : "w-[min(540px,calc(100vw-2rem))]",
];

const menuInnerClass = (category: CategoriaNode) =>
  hasChildren(category)
    ? "grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:gap-6"
    : "p-5";

const desktopLinkClass =
  "relative inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-[14px] leading-[20px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary";

const desktopLinkStateClass = (category: CategoriaNode) =>
  isCategoryActive(category)
    ? "font-semibold text-primary-foreground after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:rounded-full after:bg-primary-foreground/90"
    : "font-medium text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground";

const moreTriggerClass = computed(() =>
  isMoreActive.value
    ? "font-semibold text-primary-foreground after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:rounded-full after:bg-primary-foreground/90"
    : "font-medium text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground"
);

const productLinkClass =
  "flex min-w-0 w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-foreground/88 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";
</script>

<template>
  <nav class="w-full bg-primary" aria-label="Categorías">
    <div
      class="mx-auto w-full max-w-[1440px] min-w-0 px-4 py-2 sm:px-6 lg:px-10 xl:px-4 2xl:px-10"
    >
      <div
        v-if="!hasCategories"
        class="text-center text-[14px] leading-[20px] text-primary-foreground/80 md:text-left"
      >
        <span v-if="pending">Cargando…</span>
        <span v-else-if="error">No se ha podido cargar el menú.</span>
        <span v-else>(Sin categorías)</span>
      </div>

      <template v-else>
        <div class="sr-only" aria-live="polite">
          <span v-if="pending">Actualizando categorías</span>
        </div>

        <!-- Compact: móvil, tablet y desktop pequeño -->
        <div class="min-w-0 xl:hidden">
          <div class="flex w-full flex-wrap items-center justify-center gap-2">
            <NuxtLink
              v-for="cat in categories"
              :key="nodeKeyOf(cat)"
              :to="toCat(cat)"
              class="rounded-full border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              :class="
                isCategoryActive(cat)
                  ? 'border-primary-foreground bg-primary-foreground text-primary shadow-sm'
                  : 'border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:border-primary-foreground/35 hover:bg-primary-foreground/15'
              "
            >
              {{ labelOf(cat) }}
            </NuxtLink>
          </div>
        </div>

        <!-- Desktop real -->
        <div
          ref="desktopMenu"
          class="relative hidden w-full min-w-0 overflow-hidden xl:block"
        >
          <Menubar
            class="mx-auto flex h-auto w-full flex-nowrap items-center justify-center gap-x-2 space-x-0 !border-0 !bg-transparent !p-0 !shadow-none 2xl:gap-x-4"
          >
            <MenubarMenu
              v-for="cat in directCategories"
              :key="nodeKeyOf(cat)"
            >
              <template v-if="hasDropdown(cat)">
                  <div class="inline-flex items-center gap-1">
                    <NuxtLink
                      :to="toCat(cat)"
                      :class="[desktopLinkClass, desktopLinkStateClass(cat)]"
                    >
                      {{ labelOf(cat) }}
                    </NuxtLink>

                    <MenubarTrigger as-child>
                      <button
                        type="button"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary-foreground/90 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary data-[state=open]:bg-primary-foreground/15 data-[state=open]:text-primary-foreground"
                        :aria-label="`Abrir submenú de ${labelOf(cat)}`"
                      >
                        <ChevronDownIcon
                          class="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
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

                          <div
                            v-if="hasPreviewProducts(sub)"
                            class="flex flex-col gap-1"
                          >
                            <MenubarItem
                              v-for="prod in previewProducts(sub)"
                              :key="prod.path || prod.slug || prod.title"
                              as-child
                            >
                              <NuxtLink
                                :to="toProd(prod)"
                                :prefetch="false"
                                :class="productLinkClass"
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

                                <span class="min-w-0 truncate">
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
                              :class="productLinkClass"
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

                              <span class="min-w-0 truncate">
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
                  :class="[desktopLinkClass, desktopLinkStateClass(cat)]"
                >
                  {{ labelOf(cat) }}
                </NuxtLink>
              </template>
            </MenubarMenu>

            <MenubarMenu v-if="overflowCategories.length">
              <MenubarTrigger
                class="relative inline-flex h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-full !px-2.5 text-[14px] leading-[20px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary data-[state=open]:bg-primary-foreground/15 data-[state=open]:text-primary-foreground"
                :class="moreTriggerClass"
                :aria-label="`Abrir ${overflowCategories.length} categorías adicionales`"
              >
                Más
                <ChevronDownIcon
                  class="h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
              </MenubarTrigger>

              <MenubarContent
                align="end"
                class="w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-border/70 bg-popover p-2 text-popover-foreground shadow-xl"
              >
                <template
                  v-for="cat in overflowCategories"
                  :key="nodeKeyOf(cat)"
                >
                  <MenubarSub v-if="hasDropdown(cat)">
                    <MenubarSubTrigger
                      class="rounded-lg px-3 py-2.5 text-sm"
                      :class="
                        isCategoryActive(cat)
                          ? 'bg-accent font-semibold text-accent-foreground'
                          : 'text-foreground/90'
                      "
                    >
                      {{ labelOf(cat) }}
                    </MenubarSubTrigger>

                    <MenubarSubContent
                      class="w-[min(360px,calc(100vw-2rem))] rounded-xl border border-border/70 bg-popover p-2 text-popover-foreground shadow-xl"
                    >
                      <MenubarItem as-child>
                        <NuxtLink
                          :to="toCat(cat)"
                          class="flex w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        >
                          Ver {{ labelOf(cat) }}
                        </NuxtLink>
                      </MenubarItem>

                      <MenubarItem
                        v-for="sub in childrenOf(cat)"
                        :key="nodeKeyOf(sub)"
                        as-child
                      >
                        <NuxtLink
                          :to="toCat(sub)"
                          class="flex w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm text-foreground/90 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        >
                          {{ labelOf(sub) }}
                        </NuxtLink>
                      </MenubarItem>

                      <MenubarItem
                        v-for="prod in hasChildren(cat) ? [] : previewProducts(cat)"
                        :key="prod.path || prod.slug || prod.title"
                        as-child
                      >
                        <NuxtLink
                          :to="toProd(prod)"
                          :prefetch="false"
                          class="flex w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm text-foreground/90 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        >
                          {{ productLabelOf(prod) }}
                        </NuxtLink>
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>

                  <MenubarItem v-else as-child>
                    <NuxtLink
                      :to="toCat(cat)"
                      class="flex w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      :class="
                        isCategoryActive(cat)
                          ? 'bg-accent font-semibold text-accent-foreground'
                          : 'text-foreground/90 hover:bg-accent hover:text-accent-foreground'
                      "
                    >
                      {{ labelOf(cat) }}
                    </NuxtLink>
                  </MenubarItem>
                </template>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          <div
            class="pointer-events-none absolute inset-x-0 top-0 invisible flex flex-wrap items-center gap-x-2 2xl:gap-x-4"
            aria-hidden="true"
          >
            <div
              v-for="(cat, index) in categories"
              :key="`measure-${nodeKeyOf(cat)}`"
              :ref="(element) => setDesktopMeasurement(element, index)"
              class="inline-flex shrink-0"
            >
              <div v-if="hasDropdown(cat)" class="inline-flex items-center gap-1">
                <span :class="desktopLinkClass">{{ labelOf(cat) }}</span>
                <span class="inline-flex h-8 w-8 shrink-0" />
              </div>
              <span v-else :class="desktopLinkClass">{{ labelOf(cat) }}</span>
            </div>

            <span
              ref="moreMeasurement"
              class="inline-flex h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[14px] leading-[20px]"
            >
              Más
              <ChevronDownIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
            </span>
          </div>
        </div>
      </template>
    </div>
  </nav>
</template>
