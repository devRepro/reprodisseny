<script setup lang="ts">
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger
} from '@/components/ui/menubar'
import { Icon } from '#components'
import { navigateTo } from '#app'

const { data: docs } = await useCategoriasNav()
const isMobileOpen = ref(false)
</script>

<template>
  <!-- ✅ CABECERA MÓVIL -->
  <div class="md:hidden w-full px-4 pt-4 flex justify-end">
    <button
      @click="isMobileOpen = !isMobileOpen"
      class="p-2 rounded-md border bg-white shadow-sm"
      aria-label="Abrir menú"
    >
      <Icon :name="isMobileOpen ? 'tabler:x' : 'tabler:menu-2'" size="1.8rem" />
    </button>
  </div>

  <!-- ✅ MENÚ MÓVIL -->
  <transition name="fade">
    <div v-if="isMobileOpen" class="md:hidden px-4 pt-4 pb-8 space-y-8">
      <!-- Categorías -->
      <div>
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Categorías</h2>
        <ul class="space-y-2">
          <li v-for="category in docs?.[0]?.children" :key="category.slug">
            <NuxtLink
              :to="`/categorias/${category.slug}`"
              class="block text-gray-800 text-base font-medium hover:text-gray-600"
              @click="isMobileOpen = false"
            >
              {{ category.nav || category.title || category.slug }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Información inferior -->
      <div class="pt-6 border-t space-y-3">
        <NuxtLink
          to="tel:+34932749890"
          class="flex items-center text-gray-700 hover:text-black text-sm"
        >
          <Icon name="tabler:phone-call" class="mr-2 text-gray-500" size="1.5rem" />
          +34 93 274 98 90
        </NuxtLink>
        <NuxtLink to="/contacto" class="block text-sm text-gray-700 hover:text-black">Contacto</NuxtLink>
        <NuxtLink to="/novedades" class="block text-sm text-gray-700 hover:text-black">Novedades</NuxtLink>
        <NuxtLink to="/blog" class="block text-sm text-gray-700 hover:text-black">Blog</NuxtLink>
      </div>
    </div>
  </transition>

  <!-- ✅ MENÚ DE ESCRITORIO -->
  <div class="hidden md:flex justify-center border-b">
    <div class="w-full">
      <Menubar class="gap-4 justify-start">
        <MenubarMenu
          v-for="category in docs?.[0]?.children"
          :key="category.slug"
        >
          <MenubarTrigger>
            {{ category.nav || category.title || category.slug }}
          </MenubarTrigger>

          <MenubarContent>
            <!-- Enlace directo a la categoría -->
            <MenubarItem @click="navigateTo(`/categorias/${category.slug}`)">
              Ver categoría
            </MenubarItem>

            <!-- Productos -->
            <MenubarItem
              v-for="product in category.children"
              :key="product.slug"
              @click="navigateTo(`/categorias/${product.slug}`)"
            >
              {{ product.nav || product.title || product.slug }}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
