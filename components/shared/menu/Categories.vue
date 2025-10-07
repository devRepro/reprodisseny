<!-- components/shared/menu/Categorias.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useCategoriasNav } from "@/composables/useCategoriasNav";

// shadcn/ui
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from "@/components/ui/menubar";

const router = useRouter();
const { data, pending, error } = await useCategoriasNav();

const categories = computed(() =>
  Array.isArray(data.value?.tree) ? data.value!.tree : []
);

// DEBUG opcional
if (process.client) {
  console.debug("[CategoriasMenu] data.tree:", data.value?.tree);
}
</script>

<template>
  <!-- OJO: esto oculta el menú en móvil -->
  <nav class="hidden md:block border-t border-b">
    <div class="max-w-7xl mx-auto px-6 py-3">
      <!-- Mensajes fuera del Menubar -->
      <div v-if="pending" class="text-sm text-gray-500">Cargando…</div>
      <div v-else-if="error" class="text-sm text-red-600">No se pudo cargar el menú.</div>
      <div v-else-if="!categories.length" class="text-sm text-gray-500">
        (Sin categorías)
      </div>

      <Menubar v-else class="gap-6 !border-none !shadow-none !bg-transparent">
        <MenubarMenu
          v-for="cat in categories"
          :key="cat.id || cat.slug || cat.path || cat.title"
        >
          <MenubarTrigger
            @click="
              !cat.children?.length && router.push(cat.path || `/categorias/${cat.slug}`)
            "
          >
            {{ cat.nav || cat.title || cat.slug }}
          </MenubarTrigger>

          <MenubarContent v-if="cat.children?.length">
            <!-- Enlace destacado a la categoría -->
            <MenubarItem v-if="cat.path" asChild class="font-semibold text-primary">
              <NuxtLink :to="cat.path"> Ver {{ cat.nav || cat.title }} </NuxtLink>
            </MenubarItem>

            <MenubarSeparator v-if="cat.path" />

            <!-- Hijos -->
            <MenubarItem
              v-for="sub in cat.children"
              :key="sub.id || sub.slug || sub.path || sub.title"
              asChild
            >
              <NuxtLink :to="sub.path || `/categorias/${sub.slug}`">
                {{ sub.nav || sub.title || sub.slug }}
              </NuxtLink>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  </nav>
</template>
