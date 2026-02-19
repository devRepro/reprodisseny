<script setup lang="ts">
import { ref, computed, unref, type PropType, type Ref } from "vue"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import HeaderSearch from "@/components/layout/HeaderSearch.vue"
import CategoriasMenu from "@/components/shared/menu/Categorias.vue"
import type { CategoriaNode } from "~/composables/useCategoriasNav"

import { Search, Menu, Phone, X } from "lucide-vue-next"

type MaybeRef<T> = T | Ref<T>

const props = defineProps({
  menuTree: { type: Array as PropType<CategoriaNode[]>, default: () => [] },
  menuPending: { type: [Boolean, Object] as PropType<MaybeRef<boolean>>, default: false },
  menuError: {
    type: [Object, Boolean, String, Number] as PropType<MaybeRef<unknown> | null>,
    default: null,
  },
  showMenu: { type: Boolean, default: true },
})

const isMobileSearchOpen = ref(false)

const pendingValue = computed(() => Boolean(unref(props.menuPending)))
const errorValue = computed(() => {
  const v = unref(props.menuError as any)
  if (v == null || v === false) return null
  if (typeof v === "string" && v.trim() === "") return null
  return v
})
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
          <span class="hidden xl:inline text-[14px] font-medium whitespace-nowrap"
            >+34 932 749 890</span
          >
        </a>

        <NuxtLink
          to="/pedir-presupuesto"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap h-9 md:h-11 rounded-lg bg-[#0076B3] px-3 md:px-6 text-[13px] md:text-[14px] font-semibold text-white hover:bg-[#006aa1] shadow-sm transition-all"
        >
          <span class="hidden sm:inline text-sm">Pide presupuesto</span>
          <span class="sm:hidden text-xs">Presupuesto</span>
        </NuxtLink>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              class="h-10 w-10 p-0 rounded-lg hover:bg-slate-50"
              aria-label="Menú"
            >
              <Menu class="h-6 w-6 text-[#212121]" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            class="w-64 mt-2 p-2 shadow-xl border-slate-200"
          >
            <div class="lg:hidden p-2 mb-2 bg-slate-50 rounded-lg">
              <HeaderSearch />
            </div>

            <DropdownMenuItem
              as-child
              class="cursor-pointer py-2 px-3 focus:bg-sky-50 rounded-md"
            >
              <NuxtLink to="/sobre-nosotros" class="w-full font-medium"
                >Sobre nosotros</NuxtLink
              >
            </DropdownMenuItem>
            <DropdownMenuItem
              as-child
              class="cursor-pointer py-2 px-3 focus:bg-sky-50 rounded-md"
            >
              <NuxtLink to="/contacto" class="w-full font-medium">Contacto</NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem
              as-child
              class="cursor-pointer py-2 px-3 focus:bg-sky-50 rounded-md"
            >
              <NuxtLink to="/como-preparar-archivos" class="w-full font-medium"
                >Cómo preparar archivo</NuxtLink
              >
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div
      v-if="isMobileSearchOpen"
      class="lg:hidden bg-white border-t border-slate-50 px-4 py-3 shadow-inner"
    >
      <HeaderSearch />
    </div>

    <div v-if="showMenu" class="hidden lg:block border-t border-slate-50">
      <CategoriasMenu :tree="menuTree" :pending="pendingValue" :error="errorValue" />
    </div>
  </header>
</template>

<style scoped>
/* Transición suave para el buscador móvil */
.v-enter-active,
.v-leave-active {
  transition: all 0.2s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
