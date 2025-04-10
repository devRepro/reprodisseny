<script setup lang="ts">
import {
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem
} from '@/components/ui/menubar'

import { NuxtImg } from '#components'
import { navigateTo } from '#app'

defineProps<{
  category: {
    slug: string
    nav: string
    title?: string
    alt?: string
    image?: string
    children?: {
      slug: string
      title?: string
      nav?: string
    }[]
  }
}>()
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      {{ category.nav || category.title || category.slug }}
    </MenubarTrigger>
    {{ category.image }}
    <MenubarContent class="w-[720px] grid grid-cols-3 gap-6 p-4 bg-white shadow-xl rounded-xl z-50">
      <!-- 🧾 Lista de productos (col 1-2) -->
      <div class="col-span-2">
        <h4 class="text-sm text-muted-foreground font-semibold mb-2">Productos</h4>
        <ul class="space-y-1">
          <li
            v-for="product in category.children"
            :key="product.slug"
            class="text-sm text-gray-800 hover:text-primary cursor-pointer"
            @click="navigateTo(`/categorias/${product.slug}`)"
          >
            {{ product.title || product.nav || product.slug }}
          </li>
        </ul>
      </div>
      
      <!-- 🖼 Imagen + CTA a categoría -->
      <div class="col-span-1 flex flex-col items-center justify-between">
        
        <pre>{{ category.image}} </pre>
        <p class="text-xs text-red-600">
           <img src="/public/img/categorias/eventos.png">
        </p>


        <p class="text-xs text-gray-500 text-center mb-1">
          {{ category.nav || category.title }}
        </p>
        <button
          class="text-sm font-semibold text-primary hover:underline"
          @click="navigateTo(`/categorias/${category.slug}`)"
        >
          Ver categoría →
        </button>
      </div>
    </MenubarContent>
  </MenubarMenu>
</template>
