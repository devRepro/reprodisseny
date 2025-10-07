<!-- components/shared/menu/Categorias.vue -->
<script setup lang="ts">
import { Icon } from "#components";
import { computed } from "vue";
import { useCategoriasNav } from "@/composables/useCategoriasNav";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from "@/components/ui/menubar";

const { data, pending, error } = await useCategoriasNav();
const categories = computed(() => data.value?.tree ?? []);
console.debug("useCategoriasNav data:", data.value);
</script>
<template>
  <nav class="hidden md:block border-t border-b">
    <div class="max-w-7xl mx-auto px-6">
      <Menubar class="gap-6 py-3 !border-none !shadow-none !bg-transparent">
        <template v-if="pending"
          ><span class="text-sm text-gray-500">Cargando…</span></template
        >
        <template v-else-if="error"
          ><span class="text-sm text-red-600">No se pudo cargar el menú.</span></template
        >

        <template v-else>
          <MenubarMenu
            v-for="cat in categories"
            :key="cat.id || cat.slug || cat.path || cat.title"
          >
            <MenubarTrigger
              @click="
                !cat.children?.length &&
                  $router.push(cat.path || `/categorias/${cat.slug}`)
              "
            >
              {{ cat.nav || cat.title || cat.slug }}
            </MenubarTrigger>

            <MenubarContent v-if="cat.children?.length">
              <NuxtLink v-if="cat.path" :to="cat.path" class="block">
                <MenubarItem class="font-semibold text-primary"
                  >Ver {{ cat.nav || cat.title }}</MenubarItem
                >
              </NuxtLink>
              <MenubarSeparator v-if="cat.path" />
              <NuxtLink
                v-for="sub in cat.children"
                :key="sub.id || sub.slug || sub.path || sub.title"
                :to="sub.path || `/categorias/${sub.slug}`"
                class="block"
              >
                <MenubarItem>{{ sub.nav || sub.title || sub.slug }}</MenubarItem>
              </NuxtLink>
            </MenubarContent>
          </MenubarMenu>
        </template>
      </Menubar>
    </div>
  </nav>
</template>
