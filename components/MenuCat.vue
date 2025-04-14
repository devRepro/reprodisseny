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
  <div class="hidden md:flex justify-center border-b">
    <div class="w-full">
      <Menubar class="gap-4 justify-start">
        <template v-if="categories.length > 0" v-for="category in categories" :key="category.slug">
          <MenubarMenu>
            <MenubarTrigger>
              {{ category.nav || category.slug }}
            </MenubarTrigger>

            <MenubarContent>
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
