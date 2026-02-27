<script setup lang="ts">
import { ref, computed, unref, watch, type Ref } from "vue"
import type { CategoriaNode } from "~/composables/useCategoriasNav"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import HeaderSearch from "@/components/layout/HeaderSearch.vue"
import CategoriasMenu from "@/components/shared/menu/Categorias.vue"

import { Search, Menu, Phone, X, ChevronDown } from "lucide-vue-next"

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
const menuOpen = ref(false)

watch(menuOpen, (v) => {
  if (v) isMobileSearchOpen.value = false
})
watch(isMobileSearchOpen, (v) => {
  if (v) menuOpen.value = false
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
const toCat = (c: any) => c?.path || (c?.slug ? `/categorias/${c.slug}` : "/categorias")
const toProd = (p: any) => p?.path || (p?.slug ? `/productos/${p.slug}` : "/productos")

const hasDropdown = (c: CategoriaNode) =>
  (c?.children?.length ?? 0) > 0 || (c?.products?.length ?? 0) > 0

const staticLinks = [
  { to: "/sobre-nosotros", label: "Sobre nosotros" },
  { to: "/contacto", label: "Contacto" },
  { to: "/como-preparar-archivos", label: "Cómo preparar archivo" },
]
</script>

<template>
  <header class="w-full bg-white border-b border-slate-100 sticky top-0 z-[50]">
    <div
      class="mx-auto max-w-[1440px] h-16 md:h-20 px-4 md:px-6 lg:px-[80px] flex items-center justify-between gap-4 md:gap-8"
    >
      <NuxtLink to="/" class="flex items-center shrink-0" aria-label="Inicio">
        <SharedLogo class="h-7 w-auto md:h-9 lg:h-10 lg:w-[218px]" />
        <span class="sr-only">Repro Disseny</span>
      </NuxtLink>

      <div class="hidden lg:flex flex-1 max-w-[500px] justify-center">
        <HeaderSearch class="w-full" />
      </div>

      <div class="flex items-center gap-1 md:gap-3 shrink-0">
        <!-- Mobile search toggle -->
        <button
          @click="isMobileSearchOpen = !isMobileSearchOpen"
          class="lg:hidden p-2 text-slate-500 hover:text-sky-700 transition-colors"
          aria-label="Buscar"
        >
          <Search v-if="!isMobileSearchOpen" class="h-6 w-6" />
          <X v-else class="h-6 w-6" />
        </button>

        <a
          href="tel:+34932749890"
          class="flex items-center gap-2 text-slate-400 hover:text-sky-700 p-2 transition-colors"
          aria-label="Llamar"
        >
          <Phone class="h-5 w-5 md:h-4 md:w-4" />
          <span class="hidden xl:inline text-[14px] font-medium whitespace-nowrap">
            +34 932 749 890
          </span>
        </a>

        <NuxtLink
          to="/pedir-presupuesto"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap h-9 md:h-11 rounded-lg bg-[#0076B3] px-3 md:px-6 text-[13px] md:text-[14px] font-semibold text-white hover:bg-[#006aa1] shadow-sm transition-all"
        >
          <span class="hidden sm:inline text-sm">Pide presupuesto</span>
          <span class="sm:hidden text-xs">Presupuesto</span>
        </NuxtLink>

        <!-- ✅ HAMBURGUESA -->
        <DropdownMenu v-model:open="menuOpen">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="h-10 w-10 p-0 rounded-lg hover:bg-slate-50" aria-label="Menú">
              <Menu class="h-6 w-6 text-[#212121]" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            class="w-[min(92vw,420px)] mt-2 p-2 shadow-xl border-slate-200 max-h-[calc(100vh-6rem)] overflow-y-auto"
          >
            <!-- Buscador dentro del menú (solo <lg) -->
            <div class="lg:hidden p-2 mb-2 bg-slate-50 rounded-lg">
              <HeaderSearch />
            </div>

            <!-- ✅ Categorías dentro del menú (solo <lg) -->
            <div class="lg:hidden mt-2">
              <div class="px-2 pt-2 pb-2 border-t border-slate-100">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Categorías
                </p>
              </div>

              <div v-if="pendingValue" class="px-2 pb-2 text-sm text-slate-500">
                Cargando categorías…
              </div>
              <div v-else-if="errorValue" class="px-2 pb-2 text-sm text-red-600">
                No se pudo cargar el menú.
              </div>
              <div v-else-if="!categories.length" class="px-2 pb-2 text-sm text-slate-500">
                (Sin categorías)
              </div>

              <div v-else class="space-y-1 px-1 pb-2">
                <template v-for="cat in categories" :key="cat.id || cat.slug || cat.path || cat.title">
                  <!-- Category simple -->
                  <DropdownMenuItem v-if="!hasDropdown(cat)" as-child class="cursor-pointer rounded-md">
                    <NuxtLink
                      :to="toCat(cat)"
                      class="w-full px-3 py-2 text-sm font-medium text-slate-800 rounded-md hover:bg-slate-50"
                      @click="menuOpen = false"
                    >
                      {{ labelOf(cat) }}
                    </NuxtLink>
                  </DropdownMenuItem>

                  <!-- Category accordion -->
                  <div v-else class="rounded-xl border border-slate-200 bg-white">
                    <details class="group">
                      <summary
                        class="list-none px-3 py-2 flex items-center justify-between gap-3 cursor-pointer rounded-xl hover:bg-slate-50"
                      >
                        <span class="text-sm font-semibold text-slate-900 truncate">
                          {{ labelOf(cat) }}
                        </span>
                        <ChevronDown
                          class="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>

                      <div class="px-3 pb-3 pt-1 space-y-3">
                        <!-- Ver todo -->
                        <DropdownMenuItem as-child class="cursor-pointer rounded-md">
                          <NuxtLink
                            :to="toCat(cat)"
                            class="w-full inline-flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                            @click="menuOpen = false"
                          >
                            <span>Ver todo</span>
                            <span class="text-slate-400">→</span>
                          </NuxtLink>
                        </DropdownMenuItem>

                        <!-- Subcategorías -->
                        <div v-if="cat.children?.length" class="space-y-1">
                          <p class="text-xs font-semibold text-slate-500">Subcategorías</p>

                          <div class="grid grid-cols-1 gap-1">
                            <DropdownMenuItem
                              v-for="sub in cat.children"
                              :key="sub.id || sub.slug || sub.path || sub.title"
                              as-child
                              class="cursor-pointer rounded-md"
                            >
                              <NuxtLink
                                :to="toCat(sub)"
                                class="w-full rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between gap-3"
                                @click="menuOpen = false"
                              >
                                <span class="truncate">{{ labelOf(sub) }}</span>
                                <span v-if="(sub.products?.length ?? 0) > 0" class="text-xs text-slate-400">
                                  {{ sub.products.length }}
                                </span>
                              </NuxtLink>
                            </DropdownMenuItem>
                          </div>
                        </div>

                        <!-- Productos (si no hay children, mostramos algunos) -->
                        <div v-else-if="cat.products?.length" class="space-y-2">
                          <p class="text-xs font-semibold text-slate-500">Productos</p>

                          <div class="grid grid-cols-2 gap-2">
                            <DropdownMenuItem
                              v-for="prod in (cat.products || []).slice(0, 8)"
                              :key="prod.slug"
                              as-child
                              class="cursor-pointer rounded-md"
                            >
                              <NuxtLink
                                :to="toProd(prod)"
                                class="rounded-md border border-slate-200 bg-white p-2 hover:bg-slate-50 min-w-0"
                                @click="menuOpen = false"
                              >
                                <span class="block text-xs font-medium text-slate-800 truncate">
                                  {{ prod.title }}
                                </span>
                              </NuxtLink>
                            </DropdownMenuItem>
                          </div>

                          <p v-if="(cat.products?.length ?? 0) > 8" class="text-xs text-slate-400">
                            +{{ cat.products.length - 8 }} más…
                          </p>
                        </div>
                      </div>
                    </details>
                  </div>
                </template>
              </div>
            </div>

            <!-- Links estáticos -->
            <div class="mt-2 border-t border-slate-100 pt-2">
              <DropdownMenuItem
                v-for="l in staticLinks"
                :key="l.to"
                as-child
                class="cursor-pointer py-2 px-3 focus:bg-sky-50 rounded-md"
              >
                <NuxtLink :to="l.to" class="w-full font-medium" @click="menuOpen = false">
                  {{ l.label }}
                </NuxtLink>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Mobile search panel -->
    <Transition name="slide-down">
      <div
        v-if="isMobileSearchOpen"
        class="lg:hidden bg-white border-t border-slate-50 px-4 py-3 shadow-inner"
      >
        <HeaderSearch />
      </div>
    </Transition>

    <!-- Desktop categories bar -->
    <div v-if="showMenu" class="hidden lg:block border-t border-slate-50">
      <CategoriasMenu :tree="menuTree" :pending="pendingValue" :error="errorValue" />
    </div>
  </header>
</template>

<style scoped>
/* Transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>