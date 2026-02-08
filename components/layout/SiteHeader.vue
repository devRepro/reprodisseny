<!-- components/layout/SiteHeader.vue -->
<script setup lang="ts">
import { computed, unref, type PropType, type Ref } from "vue"
import { NuxtLink } from "#components"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import CategoriasMenu from "@/components/shared/menu/Categorias.vue"
import type { CategoriaNode } from "~/composables/useCategoriasNav"

import { Search, Menu, Phone } from "lucide-vue-next"

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

const pendingValue = computed(() => Boolean(unref(props.menuPending)))
const errorValue = computed(() => {
  const v = unref(props.menuError as any)
  if (v == null || v === false) return null
  if (typeof v === "string" && v.trim() === "") return null
  return v
})
</script>

<template>
  <header class="w-full bg-white">
    <!-- TOP HEADER (logo + buscador + phone + CTA + hamburguesa) -->
    <div
      class="mx-auto max-w-[1440px] h-12 px-[80px] flex items-center justify-between gap-20"
    >
      <!-- Logo (218x40) -->
      <NuxtLink
        to="/"
        class="flex items-center h-10 w-[218px] shrink-0"
        aria-label="Inicio"
      >
        <SharedLogo class="h-10 w-[218px]" />
        <span class="sr-only">Repro Disseny</span>
      </NuxtLink>

      <!-- Buscador (centrado, 556x32) -->
      <div class="flex-1 min-w-0 flex justify-center">
        <Button
          type="button"
          variant="outline"
          aria-label="Buscar"
          class="w-full max-w-[556px] h-8 rounded-lg border border-[#959595] bg-white px-3 py-[5px] gap-2 justify-start shadow-none hover:bg-white hover:border-[#959595]"
        >
          <Search class="h-5 w-5 shrink-0 text-[#959595]" />
          <span class="text-base leading-[22px] font-normal text-[#959595]">Buscar</span>
        </Button>
      </div>

      <!-- Right: phone + CTA + hamburger -->
      <div class="flex items-center gap-4 h-9 shrink-0">
        <a
          href="tel:+34932749890"
          class="inline-flex items-center gap-2 whitespace-nowrap text-[14px] leading-[20px] font-normal text-[#959595]"
          aria-label="Llamar por teléfono"
        >
          <Phone class="h-4 w-4 shrink-0 text-[#959595]" />
          <span>+34 932 749 890</span>
        </a>

        <Button
          type="button"
          class="h-9 rounded-lg bg-[#0076B3] px-4 text-[14px] leading-[20px] font-normal text-white hover:bg-[#006aa1]"
        >
          Pide tu presupuesto
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              type="button"
              variant="ghost"
              class="h-9 w-9 p-0 rounded-lg hover:bg-transparent"
              aria-label="Abrir menú"
            >
              <Menu class="h-6 w-6 text-[#212121]" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuItem as-child>
              <NuxtLink to="/sobre-nosotros" class="w-full">Sobre nosotros</NuxtLink>
            </DropdownMenuItem>

            <DropdownMenuItem as-child>
              <NuxtLink to="/contacto" class="w-full">Contacto</NuxtLink>
            </DropdownMenuItem>

            <DropdownMenuItem as-child>
              <NuxtLink to="/como-preparar-archivo" class="w-full"
                >Cómo preparar archivo</NuxtLink
              >
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- MENÚ CATEGORÍAS (debajo del header) -->
    <CategoriasMenu
      v-if="props.showMenu"
      :tree="props.menuTree"
      :pending="pendingValue"
      :error="errorValue"
    />
  </header>
</template>
