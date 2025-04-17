<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from '@/components/ui/navigation-menu'

import { useCategoriasNav } from '@/composables/useCategoriasNav'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const { data } = await useCategoriasNav()
const categorias = computed(() => data.value?.menuItems || [])
const navigateTo = (path: string) => router.push(path)
</script>

<template>
  <div class="hidden md:flex justify-center border-b">
    <div class="w-full max-w-7xl mx-auto px-4">
      <NavigationMenu>
        <NavigationMenuList>
          <template v-for="categoria in categorias" :key="categoria.slug">
            <NavigationMenuItem class="relative">
              <NavigationMenuTrigger class="hover:underline hover:decoration-blue-600">
                {{ categoria.nav || categoria.title || categoria.slug }}
              </NavigationMenuTrigger>

              <NavigationMenuContent
                align="start"
                sideOffset="4"
                class="bg-white border shadow-md rounded-md min-w-[420px] p-4 space-y-4 z-50"
              >
                <!-- Categoría principal sin contador -->
                <div class="flex items-start">
                  <NuxtImg
                    v-if="categoria.image"
                    :src="categoria.image.startsWith('http')
                      ? categoria.image
                      : `/img/categorias/${categoria.image}`"
                    :alt="categoria.alt || categoria.title"
                    width="80"
                    height="80"
                    class="w-20 h-20 aspect-square object-cover rounded-md"
                    loading="lazy"
                  />
                  <button
                    class="ml-5 w-full text-left font-semibold text-primary hover:underline hover:decoration-blue-600"
                    @click="navigateTo(categoria.path || `/categorias/${categoria.slug}`)"
                  >
                    Ver {{ categoria.title || categoria.slug }}
                  </button>
                </div>

                <!-- Subcategorías lado a lado con contador y estilo uniforme -->
                <div
                  v-if="categoria.children.some(c => c.type === 'subcategoria')"
                  class="border-t pt-4 flex space-x-6"
                >
                  <div
                    v-for="subcategoria in categoria.children.filter(c => c.type === 'subcategoria')"
                    :key="subcategoria.slug"
                    class="w-1/3"
                  >
                    <div class="flex items-center">
                      <NuxtImg
                        v-if="subcategoria.image"
                        :src="subcategoria.image.startsWith('http')
                          ? subcategoria.image
                          : `/img/categorias/${subcategoria.image}`"
                        :alt="subcategoria.alt || subcategoria.title"
                        width="60"
                        height="60"
                        class="w-16 h-16 aspect-square object-cover rounded-md"
                        loading="lazy"
                      />
                      <button
                        class="ml-3 text-sm font-semibold text-gray-800 hover:underline hover:decoration-blue-600"
                        @click="navigateTo(subcategoria.path || `/categorias/${subcategoria.slug}`)"
                      >
                        {{ subcategoria.nav || subcategoria.title || subcategoria.slug }}
                        ({{ subcategoria.children.filter(c => c.type === 'producto').length }})
                      </button>
                    </div>

                    <!-- Productos de la subcategoría -->
                    <ul v-if="subcategoria.children.some(c => c.type === 'producto')" class="mt-2 space-y-1">
                      <li v-for="producto in subcategoria.children.filter(c => c.type === 'producto')" :key="producto.slug">
                        <button
                          class="text-sm text-left w-full hover:underline hover:decoration-blue-600"
                          @click="navigateTo(producto.path || `/categorias/${subcategoria.slug}/${producto.slug}`)"
                        >
                          {{ producto.title || producto.slug }}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Productos directos de la categoría -->
                <div
                  v-if="categoria.children.some(c => c.type === 'producto')"
                  class="mt-4 border-t pt-2"
                >
                  <div class="text-sm font-semibold text-gray-800 mb-1">
                    Productos ({{ categoria.children.filter(c => c.type === 'producto').length }})
                  </div>
                  <ul class="space-y-1">
                    <li v-for="producto in categoria.children.filter(c => c.type === 'producto')" :key="producto.slug">
                      <button
                        class="text-sm text-left w-full hover:underline hover:decoration-blue-600"
                        @click="navigateTo(producto.path || `/categorias/${categoria.slug}/${producto.slug}`)"
                      >
                        {{ producto.title || producto.slug }}
                      </button>
                    </li>
                  </ul>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </template>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  </div>
</template>
