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

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="hidden md:flex justify-center border-b">
    <div class="w-full max-w-7xl mx-auto px-4">
      <NavigationMenu>
        <NavigationMenuList>
          <template v-for="categoria in categorias" :key="categoria.slug">
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                {{ categoria.nav || categoria.title || categoria.slug }}
              </NavigationMenuTrigger>

              <NavigationMenuContent class="bg-white border shadow-md rounded-md min-w-[320px] p-4 space-y-4">
                <div class="flex justify-start">
                   <NuxtImg
                    v-if="categoria.image"
                    :src=" categoria.image.startsWith('http') 
                              ? categoria.image 
                              : `/img/categorias/${categoria.image}` "
                    :alt="categoria.alt || categoria.title"
                    :width="80"
                    :height="80"
                    class="w-20 h-20 aspect-square object-cover rounded-md"
                    :sizes="`80px`"
                    loading="lazy"
                  />
                  <!-- Enlace a categoría principal -->
                  <button
                    class="w-full text-left font-semibold text-primary hover:underline ml-5"
                    @click="navigateTo(categoria.path || `/categorias/${categoria.slug}`)"
                  >
                    Ver {{ categoria.title || categoria.slug }}
                  </button>
                </div>
                <!-- Mostrar separador solo si hay subcategorías -->
                <div v-if="categoria.children.some(c => c.type === 'subcategoria')" class="border-t" />

                <!-- Subcategorías -->
                <div
                  v-for="subcategoria in categoria.children.filter(c => c.type === 'subcategoria')"
                  :key="subcategoria.slug"
                >
                  <NuxtImg
                    v-if="categoria.image"
                    :src=" categoria.image.startsWith('http') 
                              ? categoria.image 
                              : `/img/categorias/${categoria.image}` "
                    :alt="categoria.alt || categoria.title"
                    :width="80"
                    :height="80"
                    class="w-20 h-20 aspect-square object-cover rounded-md"
                    :sizes="`80px`"
                    loading="lazy"
                  />
                  <!-- Enlace a categoría principal -->
                  <div class="font-semibold text-sm text-gray-800 mt-2 mb-1">
                    {{ subcategoria.nav || subcategoria.title || subcategoria.slug }}
                  </div>

                  <!-- Productos de subcategoría -->
                  <div v-if="subcategoria.children?.length" class="pl-2 grid gap-1">
                    <button
                      v-for="producto in subcategoria.children.filter(c => c.type === 'producto')"
                      :key="producto.slug"
                      class="text-sm text-left w-full hover:bg-muted px-3 py-1 rounded"
                      @click="navigateTo(producto.path || `/categorias/${subcategoria.slug}/${producto.slug}`)"
                    >
                      {{ producto.title || producto.slug }}
                    </button>
                  </div>

                  <!-- Sub-subcategorías -->
                  <div
                    v-for="subsub in subcategoria.children?.filter(c => c.type === 'subsubcategoria') || []"
                    :key="subsub.slug"
                    class="pl-2 mt-1"
                  >
                    <div class="text-sm font-semibold text-gray-700 px-2">
                      {{ subsub.nav || subsub.title || subsub.slug }}
                    </div>
                    <div class="pl-2 grid gap-1">
                      <button
                        v-for="producto in subsub.children || []"
                        :key="producto.slug"
                        class="text-sm text-left w-full hover:bg-muted px-3 py-1 rounded"
                        @click="navigateTo(producto.path || `/categorias/${subsub.slug}/${producto.slug}`)"
                      >
                        {{ producto.title || producto.slug }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Productos directos de la categoría -->
                <div v-if="categoria.children.some(c => c.type === 'producto')" class="mt-4 border-t pt-2">
                  <div class="text-sm font-semibold text-gray-800 mb-1">Productos</div>
                  <div class="grid gap-1">
                    <button
                      v-for="producto in categoria.children.filter(c => c.type === 'producto')"
                      :key="producto.slug"
                      class="text-sm text-left w-full hover:bg-muted px-2 py-1 rounded"
                      @click="navigateTo(producto.path || `/categorias/${categoria.slug}/${producto.slug}`)"
                    >
                      {{ producto.title || producto.slug }}
                    </button>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </template>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  </div>
</template>
