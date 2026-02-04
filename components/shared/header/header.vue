<script setup lang="ts">
import { NuxtLink } from "#components"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Search, Menu, Phone } from "lucide-vue-next"
</script>

<template>
  <header class="w-full">
    <!-- Frame 144 -->
    <div
      class="mx-auto max-w-[1440px] h-12 px-20 pb-2
             grid grid-cols-[218px_1fr_auto] items-end gap-20"
    >
      <!-- Logo left (218x40) -->
      <NuxtLink
        to="/"
        class="flex items-end h-10 w-[218px] justify-self-start"
        aria-label="Inicio"
      >
        <SharedLogo class="h-10 w-[218px]" />
        <span class="sr-only">Repro Disseny</span>
      </NuxtLink>

      <!-- Buscador centered (556x32) -->
      <div class="justify-self-center">
        <Button
          type="button"
          variant="outline"
          class="w-[556px] h-8 rounded-lg border border-[#959595] bg-white
                 px-3 py-[5px] gap-2 justify-start shadow-none
                 hover:bg-white hover:border-[#959595]"
        >
          <Search class="h-5 w-5 text-[#959595]" />
          <span class="text-base leading-[140%] font-normal text-[#959595]">
            Buscar
          </span>
        </Button>
      </div>

      <!-- Right: phone + hamburger -->
      <div class="justify-self-end flex items-center gap-4 h-9">

        <a
          href="tel:+34932749890"
          class="inline-flex items-center gap-2 text-sm leading-[140%] font-normal text-[#959595]"
        >
          <Phone class="h-4 w-4" />
          <span>+34 932 749 890</span>
        </a>

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
        <NuxtLink to="/contacto" class="w-full">Cómo preparar archivo</NuxtLink>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
      </div>
    </div>
  </header>
</template>

