<script setup lang="ts">
import { NuxtLink } from "#components";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-vue-next";
</script>

<template>
  <header class="text-gray-600">
    <div class="container mx-auto flex items-center justify-between p-2 gap-6">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center shrink-0" aria-label="Inicio">
        <SharedLogo />
        <span class="sr-only">Repro Disseny</span>
      </NuxtLink>

      <!-- quita comentarios para evitar hydration mismatch -->
      <div id="buscar" class="flex items-center gap-6 flex-1 justify-end">
        <div class="relative w-[280px]">
          <SharedSearch
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
          />
          <Button
            variant="outline"
            class="w-full justify-start pl-10"
            style="color: hsl(var(--color-secondary))"
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
      </div>
    </div>
  </header>
</template>
