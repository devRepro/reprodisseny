<script setup lang="ts">
import { ref, computed, unref, watch, type Ref } from "vue";
import type { CategoriaNode } from "~/composables/useCategoriasNav";

import AppButton from "@/components/shared/button/AppButton.vue";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import HeaderSearch from "@/components/layout/HeaderSearch.vue";
import CategoriasMenu from "@/components/shared/menu/Categorias.vue";

import { Search, Menu, Phone, X, ChevronDown } from "lucide-vue-next";
import { categoryHref } from "@/utils/categoryHref";

type MaybeRef<T> = T | Ref<T>;

const props = withDefaults(
  defineProps<{
    menuTree?: CategoriaNode[];
    menuPending?: MaybeRef<boolean>;
    menuError?: MaybeRef<unknown> | null;
    showMenu?: boolean;
  }>(),
  {
    menuTree: () => [],
    menuPending: false,
    menuError: null,
    showMenu: true,
  }
);

const isMobileSearchOpen = ref(false);
const isMobileMenuOpen = ref(false);
const expandedCategories = ref<Set<string>>(new Set());

const pendingValue = computed(() => Boolean(unref(props.menuPending)));

const errorValue = computed(() => {
  const v = unref(props.menuError as any);
  if (v == null || v === false) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  return v;
});

const categories = computed<CategoriaNode[]>(() =>
  Array.isArray(props.menuTree) ? props.menuTree : []
);

const labelOf = (c: Partial<CategoriaNode> | null | undefined) =>
  c?.nav || c?.title || c?.slug || "";

const nodeKeyOf = (c: Partial<CategoriaNode> | null | undefined) =>
  c?.path || c?.slug || "";

const toCat = (c: Partial<CategoriaNode> | null | undefined) =>
  categoryHref(c);

const toProd = (p: any) =>
  p?.path || (p?.slug ? `/productos/${p.slug}` : "/productos");

const hasChildren = (c: CategoriaNode | null | undefined) =>
  Array.isArray(c?.children) && c.children.length > 0;

const hasProducts = (c: CategoriaNode | null | undefined) =>
  (c?.productCount ?? 0) > 0 && Array.isArray(c?.products) && c.products.length > 0;

const hasDropdown = (c: CategoriaNode) =>
  hasChildren(c) || (c?.productCount ?? 0) > 0;

const previewProducts = (c: CategoriaNode | null | undefined) =>
  Array.isArray(c?.products) ? c.products.slice(0, 8) : [];

const toggleExpand = (key: string) => {
  if (!key) return;

  const next = new Set(expandedCategories.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);

  expandedCategories.value = next;
};

const isExpanded = (key: string) =>
  key ? expandedCategories.value.has(key) : false;

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

watch(isMobileMenuOpen, (isOpen) => {
  if (isOpen) {
    isMobileSearchOpen.value = false;
    return;
  }

  expandedCategories.value = new Set();
});

watch(isMobileSearchOpen, (isOpen) => {
  if (isOpen) isMobileMenuOpen.value = false;
});

const staticLinks = [
  { to: "/sobre-nosotros", label: "Sobre nosotros" },
  { to: "/contacto", label: "Contacto" },
  { to: "/como-preparar-archivos", label: "Cómo preparar archivo" },
];
</script>

<template>
  <header class="sticky top-0 z-[50] w-full border-b border-slate-100 bg-white">
    <div
      class="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-6 md:h-20 md:gap-8 md:px-10 lg:px-16 2xl:px-[120px]"
    >
      <NuxtLink
        to="/"
        class="flex shrink-0 items-center"
        aria-label="Ir a la página de inicio"
      >
        <SharedLogo class="h-7 w-auto md:h-9 lg:h-10 lg:w-[218px]" />
        <span class="sr-only">Repro Disseny Inicio</span>
      </NuxtLink>

      <div class="hidden flex-1 justify-center lg:flex">
        <div class="w-full max-w-[560px]">
          <HeaderSearch class="w-full" />
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-1.5 md:gap-3">
        <AppButton
  variant="ghost"
  size="icon"
  class="shrink-0 lg:hidden text-slate-500 hover:text-sky-700"
  aria-label="Alternar barra de búsqueda"
  :aria-expanded="isMobileSearchOpen"
  @click="isMobileSearchOpen = !isMobileSearchOpen"
>
  <Search v-if="!isMobileSearchOpen" class="h-6 w-6" />
  <X v-else class="h-6 w-6" />
</AppButton>

        <a
          href="tel:+34932749890"
          class="hidden items-center gap-2 p-2 text-slate-400 transition-colors hover:text-sky-700 sm:flex"
          aria-label="Llamar a atención al cliente"
        >
          <Phone class="h-5 w-5 md:h-4 md:w-4" />
          <span class="hidden whitespace-nowrap text-[14px] font-medium xl:inline">
            +34 932 749 890
          </span>
        </a>

        <AppButton
  to="/pedir-presupuesto"
  variant="primary"
  size="md"
  class="h-9 px-2.5 text-[12px] sm:px-3 sm:text-[13px] md:h-11 md:px-6 md:text-[14px]"
>
  <span class="hidden text-sm sm:inline">Pide presupuesto</span>
  <span class="text-xs sm:hidden">Presupuesto</span>
</AppButton>

        <!-- Desktop: accesos rápidos -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
  <AppButton
    variant="ghost"
    size="icon"
    class="hidden shrink-0 lg:inline-flex"
    aria-label="Abrir accesos rápidos"
  >
    <Menu class="h-6 w-6 text-[#212121]" />
  </AppButton>
</DropdownMenuTrigger>

          <DropdownMenuContent align="end" class="w-64">
            <DropdownMenuLabel>Accesos rápidos</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              v-for="link in staticLinks"
              :key="link.to"
              as-child
            >
              <NuxtLink :to="link.to" class="w-full">
                {{ link.label }}
              </NuxtLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Mobile: sheet con categorías + enlaces estáticos al final -->
        <Sheet v-model:open="isMobileMenuOpen">
        <SheetTrigger as-child>
  <AppButton
    variant="ghost"
    size="icon"
    class="shrink-0 lg:hidden"
    aria-label="Abrir menú de navegación"
  >
    <Menu class="h-6 w-6 text-[#212121]" />
  </AppButton>
</SheetTrigger>

          <SheetContent
            side="left"
            class="flex w-[min(90vw,400px)] flex-col border-r-slate-200 p-0"
          >
            <SheetTitle class="sr-only">Menú de navegación principal</SheetTitle>

            <div class="border-b border-slate-100 bg-slate-50/50 p-4">
              <HeaderSearch @search="closeMobileMenu" />
            </div>

            <nav class="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
              <div v-if="showMenu">
                <h2
                  class="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  Categorías
                </h2>

                <div v-if="pendingValue" class="px-2 text-sm text-slate-500">
                  Cargando categorías…
                </div>

                <div v-else-if="errorValue" class="px-2 text-sm text-red-600">
                  No se pudo cargar el menú.
                </div>

                <div v-else-if="!categories.length" class="px-2 text-sm text-slate-500">
                  (Sin categorías)
                </div>

                <ul v-else class="space-y-1">
                  <li v-for="cat in categories" :key="nodeKeyOf(cat) || labelOf(cat)">
                    <NuxtLink
                      v-if="!hasDropdown(cat)"
                      :to="toCat(cat)"
                      class="flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                      @click="closeMobileMenu"
                    >
                      {{ labelOf(cat) }}
                    </NuxtLink>

                    <div
                      v-else
                      class="overflow-hidden rounded-lg bg-white transition-colors"
                      :class="{ 'bg-slate-50/50': isExpanded(nodeKeyOf(cat)) }"
                    >
                      <button
                        class="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors hover:bg-slate-50"
                        :aria-expanded="isExpanded(nodeKeyOf(cat))"
                        @click="toggleExpand(nodeKeyOf(cat))"
                      >
                        <span class="truncate text-sm font-semibold text-slate-900">
                          {{ labelOf(cat) }}
                        </span>
                        <ChevronDown
                          class="h-4 w-4 text-slate-500 transition-transform duration-200"
                          :class="{ 'rotate-180': isExpanded(nodeKeyOf(cat)) }"
                        />
                      </button>

                      <div
                        v-show="isExpanded(nodeKeyOf(cat))"
                        class="slide-down-fast space-y-3 px-3 pb-3"
                      >
                        <NuxtLink
                          :to="toCat(cat)"
                          class="inline-flex w-full items-center justify-between rounded-md bg-slate-100/50 px-3 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-50"
                          @click="closeMobileMenu"
                        >
                          <span>Ver todo {{ labelOf(cat) }}</span>
                          <span>&rarr;</span>
                        </NuxtLink>

                        <div v-if="cat.children?.length" class="mt-2 space-y-1">
                          <p
                            class="mb-2 mt-4 pl-1 text-xs font-semibold uppercase tracking-wider text-slate-400"
                          >
                            Subcategorías
                          </p>

                          <div
                            v-for="sub in cat.children"
                            :key="nodeKeyOf(sub) || labelOf(sub)"
                            class="overflow-hidden rounded-lg border border-slate-100 bg-white"
                          >
                            <button
                              v-if="hasProducts(sub)"
                              class="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50"
                              @click="toggleExpand(nodeKeyOf(sub))"
                            >
                              <span class="truncate text-sm text-slate-800">
                                {{ labelOf(sub) }}
                              </span>
                              <ChevronDown
                                class="h-4 w-4 text-slate-400 transition-transform duration-200"
                                :class="{ 'rotate-180': isExpanded(nodeKeyOf(sub)) }"
                              />
                            </button>

                            <NuxtLink
                              v-else
                              :to="toCat(sub)"
                              class="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              @click="closeMobileMenu"
                            >
                              {{ labelOf(sub) }}
                            </NuxtLink>

                            <div
                              v-show="isExpanded(nodeKeyOf(sub))"
                              class="border-t border-slate-50 bg-slate-50/50 p-2"
                            >
                              <NuxtLink
                                :to="toCat(sub)"
                                class="mb-2 block px-1 text-xs font-medium text-sky-600"
                                @click="closeMobileMenu"
                              >
                                Ver toda la subcategoría &rarr;
                              </NuxtLink>

                              <div class="grid grid-cols-1 gap-1">
                                <NuxtLink
                                  v-for="prod in previewProducts(sub)"
                                  :key="prod.path || prod.slug || prod.title"
                                  :to="toProd(prod)"
                                  class="truncate rounded-md p-2 text-xs text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                  @click="closeMobileMenu"
                                >
                                  {{ prod.title }}
                                </NuxtLink>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div v-else-if="hasProducts(cat)" class="space-y-1">
                          <p
                            class="mb-2 mt-4 pl-1 text-xs font-semibold uppercase tracking-wider text-slate-400"
                          >
                            Productos
                          </p>

                          <div class="grid grid-cols-1 gap-1 sm:grid-cols-2">
                            <NuxtLink
                              v-for="prod in previewProducts(cat)"
                              :key="prod.path || prod.slug || prod.title"
                              :to="toProd(prod)"
                              class="truncate rounded-md border border-slate-100 bg-white p-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                              @click="closeMobileMenu"
                            >
                              {{ prod.title }}
                            </NuxtLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <div
                class="mt-auto border-t border-slate-100 pt-6"
                :class="{ 'mt-0 border-t-0 pt-0': !showMenu }"
              >
                <h2
                  class="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  Más información
                </h2>

                <ul class="space-y-1">
                  <li v-for="l in staticLinks" :key="l.to">
                    <NuxtLink
                      :to="l.to"
                      class="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
                      @click="closeMobileMenu"
                    >
                      {{ l.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>

    <Transition name="slide-down">
      <div
        v-if="isMobileSearchOpen"
        class="border-t border-slate-50 bg-white px-4 py-3 shadow-inner lg:hidden"
      >
        <HeaderSearch @search="isMobileSearchOpen = false" />
      </div>
    </Transition>

    <div v-if="showMenu" class="hidden border-t border-slate-50 lg:block">
      <CategoriasMenu :tree="categories" :pending="pendingValue" :error="errorValue" />
    </div>
  </header>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-fast {
  animation: slideDownFast 0.2s ease-out forwards;
  transform-origin: top;
}

@keyframes slideDownFast {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
