<!-- components/shared/menu/Categorias.vue -->
<script setup lang="ts">
import { computed } from "vue"
import { useCategoriasNav } from "@/composables/useCategoriasNav"

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar"
import { ChevronDownIcon } from "lucide-vue-next"

// Tree + products in leaves
const { data, pending, error } = await useCategoriasNav({
  productLimit: 6,
  debug: false,
})

const categories = computed(() => data.value?.tree ?? [])
const labelOf = (c: any) => c?.nav || c?.title || c?.slug || ""
const toOf = (c: any) => c?.path || (c?.slug ? `/categorias/${c.slug}` : "/categorias")
</script>

<template>
  <!-- Figma: width 1440, height 36, padding 8px 80px, gap 47px, bg #004F78 -->
  <nav
    class="hidden md:block w-full bg-[#004F78]"
    role="navigation"
    aria-label="Categories"
  >
    <div
      class="mx-auto w-full max-w-[1440px] h-[36px] px-[80px] py-[8px] flex items-center"
    >
      <!-- States (UI text visible -> catalán) -->
      <div v-if="pending" class="text-[14px] leading-[20px] text-white/80">
        Carregant…
      </div>
      <div v-else-if="error" class="text-[14px] leading-[20px] text-white">
        No s’ha pogut carregar el menú.
      </div>
      <div v-else-if="!categories.length" class="text-[14px] leading-[20px] text-white/80">
        (Sense categories)
      </div>

      <!-- Menu -->
      <Menubar
        v-else
        class="w-full !h-[20px] !p-0 !bg-transparent !border-0 !shadow-none flex items-center justify-between gap-[47px]"
      >
        <MenubarMenu
          v-for="cat in categories"
          :key="cat.id || cat.slug || cat.path || cat.title"
          class="shrink-0"
        >
          <!-- Figma text style: 14px / 140% (≈ 20px), white -->
          <div class="flex items-center gap-1">
            <NuxtLink
              :to="toOf(cat)"
              class="whitespace-nowrap text-[14px] leading-[20px] font-normal text-white hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#004F78]"
            >
              {{ labelOf(cat) }}
            </NuxtLink>

            <!-- Dropdown trigger only if has children/products -->
            <MenubarTrigger v-if="cat.children?.length || cat.products?.length" as-child>
              <button
                type="button"
                class="inline-flex items-center justify-center p-0 text-white hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#004F78]"
                :aria-label="`Obrir submenú de ${labelOf(cat)}`"
              >
                <ChevronDownIcon class="h-4 w-4" aria-hidden="true" />
              </button>
            </MenubarTrigger>
          </div>

          <!-- Dropdown content (tu mega-menu actual) -->
          <MenubarContent
            v-if="cat.children?.length || cat.products?.length"
            class="min-w-[420px] p-2 z-50"
          >
            <!-- With subcategories -->
            <template v-if="cat.children?.length">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="sub in cat.children" :key="sub.slug" class="min-w-[200px]">
                  <div class="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                    <NuxtLink :to="sub.path || `/categorias/${sub.slug}`">
                      {{ sub.nav || sub.title || sub.slug }}
                    </NuxtLink>
                  </div>

                  <div class="flex flex-col">
                    <MenubarItem v-for="prod in sub.products || []" :key="prod.slug" asChild>
                      <NuxtLink :to="prod.path || `/productos/${prod.slug}`">
                        {{ prod.title }}
                      </NuxtLink>
                    </MenubarItem>
                    <MenubarItem v-if="(sub.products?.length ?? 0) === 0" disabled>
                      (Sense productes)
                    </MenubarItem>
                  </div>
                </div>
              </div>
            </template>

            <!-- No subcategories: products only -->
            <template v-else>
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
