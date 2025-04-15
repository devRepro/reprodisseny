<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink
} from '@/components/ui/navigation-menu'

import { useCategoriasNav } from '@/composables/useCategoriasNav'

// No usar await en layout o setup
const { data: categorias, pending } = useCategoriasNav()
</script>

<template>
<pre class="text-xs text-red-500">{{ categorias }}</pre>
  <pre class="text-xs text-green-600">{{ categorias?.value?.length }} categorías cargadas</pre>

  <NavigationMenu v-if="categorias?.value?.length" class="w-full block relative z-50" data-orientation="horizontal">
    <NavigationMenuList class="flex gap-4">
      <NavigationMenuItem v-for="categoria in categorias.value" :key="categoria.slug">
        <NavigationMenuTrigger class="text-sm font-medium text-gray-800 hover:text-primary transition">
          {{ categoria.title }}
        </NavigationMenuTrigger>

        <NavigationMenuContent
          class="min-w-[700px] px-6 py-4 grid grid-cols-12 gap-6 bg-white rounded-lg shadow-lg border"
        >
          <!-- Columna izquierda -->
          <div class="col-span-4 flex flex-col justify-center">
            <img
              v-if="categoria.image"
              :src="categoria.image"
              :alt="categoria.alt || categoria.title"
              class="w-full h-32 object-cover rounded-md mb-2"
            />
            <h3 class="text-lg font-semibold text-gray-900">{{ categoria.title }}</h3>
            <p class="text-sm text-gray-500 mt-1 leading-snug">{{ categoria.description }}</p>
          </div>

          <!-- Columna derecha -->
          <div v-if="categoria.children?.length" class="col-span-8 grid grid-cols-2 gap-4">
            <NavigationMenuLink
              v-for="producto in categoria.children"
              :key="producto.slug"
              :href="producto.path"
              class="block p-3 rounded-md border hover:border-primary transition text-sm text-gray-700 hover:text-primary bg-white hover:bg-gray-50"
            >
              {{ producto.title }}
            </NavigationMenuLink>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>

  <div v-else class="text-sm text-gray-500">Cargando menú de categorías...</div>
</template>
