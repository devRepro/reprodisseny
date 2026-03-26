<script setup lang="ts">
import { ref, computed, unref, watch, type Ref } from "vue"
import type { CategoriaNode } from "~/composables/useCategoriasNav"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"

import HeaderSearch from "@/components/layout/HeaderSearch.vue"
import CategoriasMenu from "@/components/shared/menu/Categorias.vue"

import { Search, Menu, Phone, X, ChevronDown } from "lucide-vue-next"
import { categoryHref } from "@/utils/categoryHref"

type MaybeRef<T> = T | Ref<T>

const props = withDefaults(
  defineProps<{
    menuTree?: CategoriaNode[]
    menuPending?: MaybeRef<boolean>
    menuError?: MaybeRef<unknown> | null
    showMenu?: boolean
  }>(),
  {
    menuTree: () => [],
    menuPending: false,
    menuError: null,
    showMenu: true,
  }
)

const isMobileSearchOpen = ref(false)
const isMobileMenuOpen = ref(false)
const expandedCategories = ref<Set<string>>(new Set())

const pendingValue = computed(() => Boolean(unref(props.menuPending)))

const errorValue = computed(() => {
  const v = unref(props.menuError as any)
  if (v == null || v === false) return null
  if (typeof v === "string" && v.trim() === "") return null
  return v
})

const categories = computed<CategoriaNode[]>(() =>
  Array.isArray(props.menuTree) ? props.menuTree : []
)

const labelOf = (c: Partial<CategoriaNode> | null | undefined) =>
  c?.nav || c?.title || c?.slug || ""

const nodeKeyOf = (c: Partial<CategoriaNode> | null | undefined) =>
  c?.path || c?.slug || ""

const toCat = (c: Partial<CategoriaNode> | null | undefined) =>
  categoryHref(c)

const toProd = (p: any) =>
  p?.path || (p?.slug ? `/productos/${p.slug}` : "/productos")

const hasChildren = (c: CategoriaNode | null | undefined) =>
  Array.isArray(c?.children) && c.children.length > 0

const hasProducts = (c: CategoriaNode | null | undefined) =>
  (c?.productCount ?? 0) > 0 && Array.isArray(c?.products) && c.products.length > 0

const hasDropdown = (c: CategoriaNode) =>
  hasChildren(c) || (c?.productCount ?? 0) > 0

const previewProducts = (c: CategoriaNode | null | undefined) =>
  Array.isArray(c?.products) ? c.products.slice(0, 8) : []

const toggleExpand = (key: string) => {
  if (!key) return

  const next = new Set(expandedCategories.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)

  expandedCategories.value = next
}

const isExpanded = (key: string) =>
  key ? expandedCategories.value.has(key) : false

watch(isMobileMenuOpen, (isOpen) => {
  if (isOpen) {
    isMobileSearchOpen.value = false
    return
  }

  expandedCategories.value = new Set()
})

watch(isMobileSearchOpen, (isOpen) => {
  if (isOpen) isMobileMenuOpen.value = false
})

const staticLinks = [
  { to: "/sobre-nosotros", label: "Sobre nosotros" },
  { to: "/contacto", label: "Contacto" },
  { to: "/como-preparar-archivos", label: "Cómo preparar archivo" },
]
</script>

<template>
  <header class="w-full bg-white border-b border-slate-100 sticky top-0 z-[50]">
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
        <button
          class="shrink-0 p-2 text-slate-500 transition-colors hover:text-sky-700 lg:hidden"
          aria-label="Alternar barra de búsqueda"
          :aria-expanded="isMobileSearchOpen"
          @click="isMobileSearchOpen = !isMobileSearchOpen"
        >
          <Search v-if="!isMobileSearchOpen" class="h-6 w-6" />
          <X v-else class="h-6 w-6" />
        </button>

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

        <NuxtLink
          to="/pedir-presupuesto"
          class="inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#0076B3] px-2.5 text-[12px] font-semibold text-white shadow-sm transition-all hover:bg-[#006aa1] sm:px-3 sm:text-[13px] md:h-11 md:px-6 md:text-[14px]"
        >
          <span class="hidden text-sm sm:inline">Pide presupuesto</span>
          <span class="text-xs sm:hidden">Presupuesto</span>
        </NuxtLink>

        <Sheet v-model:open="isMobileMenuOpen">
          <SheetTrigger as-child>
            <Button
              variant="ghost"
              class="h-10 w-10 shrink-0 rounded-lg p-0 hover:bg-slate-50 lg:hidden"
              aria-label="Abrir menú de navegación"
            >
              <Menu class="h-6 w-6 text-[#212121]" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            class="flex w-[min(90vw,400px)] flex-col border-r-slate-200 p-0"
          >
            <SheetTitle class="sr-only">Menú de navegación principal</SheetTitle>

            <div class="border-b border-slate-100 bg-slate-50/50 p-4">
              <HeaderSearch @search="isMobileMenuOpen = false" />
            </div>

            <nav class="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
              <!-- ... resto igual ... -->
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
