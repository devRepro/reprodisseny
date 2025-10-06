<!-- components/shared/menu/Categorias.vue -->
<script setup lang="ts">
import { Icon } from "#components";
import { useRouter } from "vue-router";
import { useCategoriasNav } from "@/composables/useCategoriasNav";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  // MenubarShortcut, MenubarSub, MenubarSubTrigger, MenubarSubContent... (si los usas)
} from "@/components/ui/menubar";
// Datos del endpoint cacheado { tree, indexById }
const { data } = await useCategoriasNav();

// Si hay nodos ocultos, ya vendrán podados desde el endpoint.
// Aun así, puedes filtrar aquí si quieres.
const categories = computed(() => data.value?.tree ?? []);

// Si quieres mantener navegación programática en algunos items:
const router = useRouter();
const navigateTo = (path: string) => router.push(path);
</script>

<template>
  <div
    class="hidden md:flex justify-center border-t border-b border-gray-200 dark:border-gray-700 bg-white shadow-sm"
  >
    <div class="w-full max-w-7xl px-6">
      <Menubar
        class="gap-6 justify-start py-3 !border-none !shadow-none !bg-transparent !p-0"
      >
        <!-- Evitamos v-if + v-for en el mismo nodo -->
        <template v-if="categories.length">
          <MenubarMenu v-for="category in categories" :key="category.slug">
            <MenubarTrigger class="text-gray-800 hover:text-primary font-medium">
              {{ category.nav || category.title || category.slug }}
            </MenubarTrigger>

            <MenubarContent class="z-50">
              <!-- Preferimos NuxtLink para SEO/SSR -->
              <NuxtLink
                :to="category.path || `/categorias/${category.slug}`"
                class="block"
              >
                <MenubarItem class="font-semibold text-primary">
                  <Icon name="lucide:arrow-right" class="mr-2 h-4 w-4" />
                  Ver categoría
                </MenubarItem>
              </NuxtLink>

              <div class="border-t my-1" />

              <template v-for="product in category.children || []" :key="product.slug">
                <NuxtLink
                  :to="product.path || `/categorias/${product.slug}`"
                  class="block"
                >
                  <MenubarItem>
                    {{ product.nav || product.title || product.slug }}
                  </MenubarItem>
                </NuxtLink>
              </template>
            </MenubarContent>
          </MenubarMenu>
        </template>
      </Menubar>
    </div>
  </div>
</template>
