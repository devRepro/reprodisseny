<!-- components/shared/menu/Categorias.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useCategoriasNav } from "@/composables/useCategoriasNav";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { ChevronDownIcon } from "lucide-vue-next";

// Traemos árbol + productos en hojas
const { data, pending, error } = await useCategoriasNav({
  productLimit: 6,
  debug: false,
});
const categories = computed(() => data.value?.tree ?? []);
</script>

<template>
  <nav class="hidden md:block border-t border-b">
    <div class="max-w-7xl mx-auto px-6 py-3">
      <div v-if="pending" class="text-sm text-gray-500">Cargando…</div>
      <div v-else-if="error" class="text-sm text-red-600">No se pudo cargar el menú.</div>
      <div v-else-if="!categories.length" class="text-sm text-gray-500">
        (Sin categorías)
      </div>

      <!-- ✅ Abrimos Menubar (faltaba) -->
      <Menubar class="gap-6 !border-none !shadow-none !bg-transparent">
        <MenubarMenu
          v-for="cat in categories"
          :key="cat.id || cat.slug || cat.path || cat.title"
        >
          <div class="flex items-center gap-1">
            <NuxtLink
              :to="cat.path || `/categorias/${cat.slug}`"
              class="text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-v isible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {{ cat.nav || cat.title || cat.slug }}
            </NuxtLink>

            <MenubarTrigger v-if="cat.children?.length || cat.products?.length" as-child>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground focus- visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-backg round"
                :aria-label="`Abrir submenú de ${cat.nav || cat.title || cat.slug}`"
              >
                <ChevronDownIcon class="h-4 w-4" aria-hidden="true" />
              </button>
            </MenubarTrigger>
          </div>

          <!-- Mostrar subcategorías (2 columnas) o productos de categoría simple -->
          <MenubarContent
            v-if="cat.children?.length || cat.products?.length"
            class="min-w-[420px] p-2 z-50"
          >
            <!-- Con subcategorías -->
            <template v-if="cat.children?.length">
              <!-- (Opcional) pequeño enlace a la categoría, aquí no molesta al trigger -->
              <!--
              <MenubarItem v-if="cat.path" asChild class="font-semibold text-primary">
                <NuxtLink :to="cat.path">Ver {{ cat.nav || cat.title }}</NuxtLink>
              </MenubarItem>
              <MenubarSeparator v-if="cat.path" />
              -->

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="sub in cat.children" :key="sub.slug" class="min-w-[200px]">
                  <div
                    class="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    <NuxtLink :to="sub.path || `/categorias/${sub.slug}`">
                      {{ sub.nav || sub.title || sub.slug }}
                    </NuxtLink>
                  </div>

                  <div class="flex flex-col">
                    <MenubarItem
                      v-for="prod in sub.products || []"
                      :key="prod.slug"
                      asChild
                    >
                      <NuxtLink :to="prod.path || `/productos/${prod.slug}`">
                        {{ prod.title }}
                      </NuxtLink>
                    </MenubarItem>
                    <MenubarItem v-if="(sub.products?.length ?? 0) === 0" disabled>
                      (Sin productos)
                    </MenubarItem>
                  </div>
                </div>
              </div>
            </template>

            <!-- Sin subcategorías: SOLO productos (❌ sin enlace de categoría para evitar clicks accidentales) -->
            <template v-else>
              <!-- ❌ eliminado el MenubarItem con NuxtLink a cat.path -->
              <MenubarItem v-for="prod in cat.products || []" :key="prod.slug" asChild>
                <NuxtLink :to="prod.path || `/productos/${prod.slug}`">
                  {{ prod.title }}
                </NuxtLink>
              </MenubarItem>
            </template>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  </nav>
</template>
