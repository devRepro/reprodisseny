<script setup lang="ts">
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from '@/components/ui/menubar'

import { Icon } from '#components'
import { useRouter } from 'vue-router'
import { useCategoriasNav } from '@/composables/useCategoriasNav'

const router = useRouter()
const { data: categories } = await useCategoriasNav()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <!-- Contenedor con línea superior e inferior -->
  <div class="hidden md:flex justify-center border-t border-b border-gray-200 dark:border-gray-700 bg-white shadow-sm">
    <div class="w-full max-w-7xl px-6">
      <Menubar class="gap-6 justify-start py-3 !border-none !shadow-none !bg-transparent !p-0">
        <template v-if="categories.length > 0" v-for="category in categories" :key="category.slug">
          <MenubarMenu>
            <MenubarTrigger class="text-gray-800 hover:text-primary font-medium">
              {{ category.nav || category.slug }}
            </MenubarTrigger>

            <MenubarContent class="z-50">
              <MenubarItem
                class="font-semibold text-primary"
                @click="navigateTo(`/categorias/${category.slug}`)"
              > 
                <Icon name="lucide:arrow-right" class="mr-2 h-4 w-4" />
                Ver categoría
              </MenubarItem>

              <div class="border-t my-1" />

              <template v-for="product in category.children || []" :key="product.slug">
                <MenubarItem @click="navigateTo(`/categorias/${product.slug}`)">
                  {{ product.title || product.slug }}
                </MenubarItem>
              </template>
            </MenubarContent>
          </MenubarMenu>
        </template>
      </Menubar>
    </div>
  </div>
</template>
