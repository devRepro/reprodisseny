<script setup lang="ts">
import { ref, computed, unref, watch, type Ref } from "vue"
import type { CategoriaNode } from "~/composables/useCategoriasNav"

import { Button } from "@/components/ui/button"
// Implementamos Sheet para una experiencia móvil superior
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

// Estado reactivo para gestionar los acordeones sin depender de <details>
const expandedCategories = ref<Set<string>>(new Set())

const toggleExpand = (key: string) => {
  const newSet = new Set(expandedCategories.value)
  if (newSet.has(key)) {
    newSet.delete(key)
  } else {
    newSet.add(key)
  }
  expandedCategories.value = newSet
}

const isExpanded = (key: string) => expandedCategories.value.has(key)

// Cerrar paneles cruzados por UX
watch(isMobileMenuOpen, (isOpen) => {
  if (isOpen) isMobileSearchOpen.value = false
})

watch(isMobileSearchOpen, (isOpen) => {
  if (isOpen) isMobileMenuOpen.value = false
})

const pendingValue = computed(() => Boolean(unref(props.menuPending)))

const errorValue = computed(() => {
  const v = unref(props.menuError as any)
  if (v == null || v === false) return null
  if (typeof v === "string" && v.trim() === "") return null
  return v
})

const categories = computed(() => props.menuTree ?? [])

const labelOf = (c: any) => c?.nav || c?.title || c?.slug || ""
const toCat = (c: any) => categoryHref(c)
const toProd = (p: any) => p?.path || (p?.slug ? `/productos/${p.slug}` : "/productos")

const hasDropdown = (c: CategoriaNode) =>
  (c?.children?.length ?? 0) > 0 || (c?.productCount ?? 0) > 0

const hasProducts = (c: any) => (c?.productCount ?? 0) > 0
const previewProducts = (c: any) => (c?.products ?? []).slice(0, 8)

const staticLinks = [
  { to: "/sobre-nosotros", label: "Sobre nosotros" },
  { to: "/contacto", label: "Contacto" },
  { to: "/como-preparar-archivos", label: "Cómo preparar archivo" },
]
</script>

<template>
  <header class="w-full bg-white border-b border-slate-100 sticky top-0 z-[50]">
    <div class="mx-auto w-full max-w-[1440px] h-16 md:h-20 px-6 md:px-10 lg:px-16 2xl:px-[120px] flex items-center justify-between gap-4 md:gap-8">
      
      <NuxtLink to="/" class="flex items-center shrink-0" aria-label="Ir a la página de inicio">
        <SharedLogo class="h-7 w-auto md:h-9 lg:h-10 lg:w-[218px]" />
        <span class="sr-only">Repro Disseny Inicio</span>
      </NuxtLink>

      <div class="hidden lg:flex flex-1 justify-center">
        <div class="w-full max-w-[560px]">
          <HeaderSearch class="w-full" />
        </div>
      </div>

      <div class="flex items-center gap-1 md:gap-3 shrink-0">
        <button
          @click="isMobileSearchOpen = !isMobileSearchOpen"
          class="lg:hidden p-2 text-slate-500 hover:text-sky-700 transition-colors"
          aria-label="Alternar barra de búsqueda"
          :aria-expanded="isMobileSearchOpen"
        >
          <Search v-if="!isMobileSearchOpen" class="h-6 w-6" />
          <X v-else class="h-6 w-6" />
        </button>

        <a href="tel:+34932749890" class="flex items-center gap-2 text-slate-400 hover:text-sky-700 p-2 transition-colors" aria-label="Llamar a atención al cliente">
          <Phone class="h-5 w-5 md:h-4 md:w-4" />
          <span class="hidden xl:inline text-[14px] font-medium whitespace-nowrap">+34 932 749 890</span>
        </a>

        <NuxtLink to="/pedir-presupuesto" class="inline-flex items-center justify-center gap-2 whitespace-nowrap h-9 md:h-11 rounded-lg bg-[#0076B3] px-3 md:px-6 text-[13px] md:text-[14px] font-semibold text-white hover:bg-[#006aa1] shadow-sm transition-all">
          <span class="hidden sm:inline text-sm">Pide presupuesto</span>
          <span class="sm:hidden text-xs">Presupuesto</span>
        </NuxtLink>

        <Sheet v-model:open="isMobileMenuOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" class="lg:hidden h-10 w-10 p-0 rounded-lg hover:bg-slate-50" aria-label="Abrir menú de navegación">
              <Menu class="h-6 w-6 text-[#212121]" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" class="w-[min(90vw,400px)] flex flex-col p-0 border-r-slate-200">
            <SheetTitle class="sr-only">Menú de navegación principal</SheetTitle>
            
            <div class="p-4 border-b border-slate-100 bg-slate-50/50">
              <HeaderSearch @search="isMobileMenuOpen = false" />
            </div>

            <nav class="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
              
              <div>
                <h2 class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-3 px-2">Categorías</h2>
                
                <div v-if="pendingValue" class="px-2 text-sm text-slate-500">Cargando categorías…</div>
                <div v-else-if="errorValue" class="px-2 text-sm text-red-600">No se pudo cargar el menú.</div>
                <div v-else-if="!categories.length" class="px-2 text-sm text-slate-500">(Sin categorías)</div>
                
                <ul v-else class="space-y-1">
                  <li v-for="cat in categories" :key="cat.slug || cat.title">
                    
                    <NuxtLink
                      v-if="!hasDropdown(cat)"
                      :to="toCat(cat)"
                      class="flex items-center w-full px-3 py-3 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
                      @click="isMobileMenuOpen = false"
                    >
                      {{ labelOf(cat) }}
                    </NuxtLink>

                    <div v-else class="rounded-lg bg-white overflow-hidden transition-colors" :class="{'bg-slate-50/50': isExpanded(cat.slug)}">
                      <button
                        @click="toggleExpand(cat.slug)"
                        class="w-full px-3 py-3 flex items-center justify-between text-left rounded-lg hover:bg-slate-50 transition-colors"
                        :aria-expanded="isExpanded(cat.slug)"
                      >
                        <span class="text-sm font-semibold text-slate-900 truncate">{{ labelOf(cat) }}</span>
                        <ChevronDown 
                          class="h-4 w-4 text-slate-500 transition-transform duration-200"
                          :class="{ 'rotate-180': isExpanded(cat.slug) }"
                        />
                      </button>

                      <div v-show="isExpanded(cat.slug)" class="px-3 pb-3 space-y-3 slide-down-fast">
                        <NuxtLink
                          :to="toCat(cat)"
                          class="w-full inline-flex items-center justify-between rounded-md bg-slate-100/50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50 transition-colors"
                          @click="isMobileMenuOpen = false"
                        >
                          <span>Ver todo {{ labelOf(cat) }}</span>
                          <span>&rarr;</span>
                        </NuxtLink>

                        <div v-if="cat.children?.length" class="space-y-1 mt-2">
                          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-2 mt-4">Subcategorías</p>
                          <div v-for="sub in cat.children" :key="sub.slug" class="border border-slate-100 rounded-lg bg-white overflow-hidden">
                            
                            <button
                              v-if="hasProducts(sub)"
                              @click="toggleExpand(sub.slug)"
                              class="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-50"
                            >
                              <span class="text-sm text-slate-800 truncate">{{ labelOf(sub) }}</span>
                              <ChevronDown 
                                class="h-4 w-4 text-slate-400 transition-transform duration-200"
                                :class="{ 'rotate-180': isExpanded(sub.slug) }"
                              />
                            </button>

                            <NuxtLink
                              v-else
                              :to="toCat(sub)"
                              class="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              @click="isMobileMenuOpen = false"
                            >
                              {{ labelOf(sub) }}
                            </NuxtLink>

                            <div v-show="isExpanded(sub.slug)" class="p-2 bg-slate-50/50 border-t border-slate-50">
                              <NuxtLink :to="toCat(sub)" class="block text-xs font-medium text-sky-600 mb-2 px-1" @click="isMobileMenuOpen = false">Ver toda la subcategoría &rarr;</NuxtLink>
                              <div class="grid grid-cols-1 gap-1">
                                <NuxtLink
                                  v-for="prod in previewProducts(sub)"
                                  :key="prod.slug"
                                  :to="toProd(prod)"
                                  class="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-md truncate transition-colors"
                                  @click="isMobileMenuOpen = false"
                                >
                                  {{ prod.title }}
                                </NuxtLink>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div v-else-if="hasProducts(cat)" class="space-y-1">
                          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-2 mt-4">Productos</p>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            <NuxtLink
                              v-for="prod in previewProducts(cat)"
                              :key="prod.slug"
                              :to="toProd(prod)"
                              class="text-sm text-slate-600 border border-slate-100 bg-white hover:bg-slate-50 p-2 rounded-md truncate transition-colors"
                              @click="isMobileMenuOpen = false"
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

              <div class="pt-6 border-t border-slate-100 mt-auto">
                <ul class="space-y-1">
                  <li v-for="l in staticLinks" :key="l.to">
                    <NuxtLink 
                      :to="l.to" 
                      class="block py-2.5 px-3 text-sm font-medium text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                      @click="isMobileMenuOpen = false"
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
      <div v-if="isMobileSearchOpen" class="lg:hidden bg-white border-t border-slate-50 px-4 py-3 shadow-inner">
        <HeaderSearch @search="isMobileSearchOpen = false" />
      </div>
    </Transition>

    <div v-if="showMenu" class="hidden lg:block border-t border-slate-50">
      <CategoriasMenu :tree="menuTree" :pending="pendingValue" :error="errorValue" />
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

/* Animación rápida para el acordeón Vue */
.slide-down-fast {
  animation: slideDownFast 0.2s ease-out forwards;
  transform-origin: top;
}
@keyframes slideDownFast {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>