<script setup lang="ts">
import { NuxtLink } from '#components'
import { Button } from "@/components/ui/button";
import { Search } from "lucide-vue-next";
import { useSearch } from "@/composables/useSearch";
</script>

<template>
  <header class="text-gray-600">
    <div class="container mx-auto flex items-center justify-between p-2 gap-6">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center shrink-0" aria-label="Inicio">
        <UiLogo />
      </NuxtLink>

      <!-- Buscador + Menú -->
      <div id="buscar" class="flex items-center gap-6 flex-1 justify-end">
        <!-- Input con icono de lupa -->
        <div class="relative w-[280px]">
          <UiCommandSearch
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
          />
          <Button
            variant="outline"
            class="w-full justify-start pl-10"
            style="color: hsl(var(--color-secondary))"
            @click="useSearch().openSearch()"
          >
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style="color: hsl(var(--color-secondary))"
            />
            <span class="text-[0.8125rem] opacity-70">
              Escribe lo que necesitas imprimir...
            </span>
          </Button>
        </div>

        <!-- Menú de contacto -->
        <UiMenuHeaderContacto />
      </div>
    </div>
  </header>

</template>
