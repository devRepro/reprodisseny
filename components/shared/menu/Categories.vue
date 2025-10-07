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

// Incluye productos; por defecto leafOnly: true → productos solo en subcategorías (hojas)
const { data, pending, error } = await useCategoriasNav({
  includeProducts: true,
  productLimit: 6, // ajusta a gusto (0 = sin límite)
  leafOnly: true,
  debug: false,
});

const categories = computed(() =>
  Array.isArray(data.value?.tree) ? data.value!.tree : []
);
</script>

<template>
  <!-- OJO: oculto en móvil -->
  <nav class="hidden md:block border-t border-b">
    <div class="max-w-7xl mx-auto px-6 py-3">
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

          <!-- Mostrar contenido si hay subcategorías o productos -->
          <MenubarContent
            v-if="cat.children?.length || cat.products?.length"
            class="min-w-[420px] p-2 z-50"
          >
            <!-- Caso A: con subcategorías → grid 2 columnas; cada sub muestra sus productos -->
            <template v-if="cat.children?.length">
              <!-- Enlace destacado a la categoría -->
              <MenubarItem v-if="cat.path" asChild class="font-semibold text-primary">
                <NuxtLink :to="cat.path">Ver {{ cat.nav || cat.title }}</NuxtLink>
              </MenubarItem>
              <MenubarSeparator v-if="cat.path" />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  v-for="sub in cat.children"
                  :key="sub.id || sub.slug || sub.path || sub.title"
                  class="min-w-[200px]"
                >
                  <!-- Cabecera subcategoría -->
                  <div
                    class="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    <NuxtLink :to="sub.path || `/categorias/${sub.slug}`">
                      {{ sub.nav || sub.title || sub.slug }}
                    </NuxtLink>
                  </div>

                  <!-- Productos de la subcategoría -->
                  <div class="flex flex-col">
                    <MenubarItem
                      v-for="prod in sub.products || []"
                      :key="prod.slug || prod.id"
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

            <!-- Caso B: sin subcategorías → productos de la categoría -->
            <template v-else>
              <MenubarItem v-if="cat.path" asChild class="font-semibold text-primary">
                <NuxtLink :to="cat.path">Ver {{ cat.nav || cat.title }}</NuxtLink>
              </MenubarItem>
              <MenubarSeparator v-if="cat.path" />

              <MenubarItem
                v-for="prod in cat.products || []"
                :key="prod.slug || prod.id"
                asChild
              >
                <NuxtLink :to="prod.path || `/productos/${prod.slug}`">
                  {{ prod.title }}
                </NuxtLink>
              </MenubarItem>

              <MenubarItem v-if="(cat.products?.length ?? 0) === 0" disabled>
                (Sin productos)
              </MenubarItem>
            </template>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  </nav>
</template>
