<template>
  <nav class="w-full bg-white">
    <ul class="flex space-x-6 px-4 py-3">
      <li
        v-for="cat in categorias"
        :key="cat.slug"
        class="relative"
        @mouseenter="handleMouseEnter(cat.slug)"
        @mouseleave="handleMouseLeave(cat.slug)"
      >
        <div class="flex items-center space-x-1">
          <!-- Enlace a la categoría -->
          <NuxtLink
            :to="`/categorias/${cat.slug}`"
            class="text-sm font-medium text-gray-800 hover:text-black"
          >
            {{ cat.nav || cat.slug }}
          </NuxtLink>

          <!-- Popover activado por hover con retraso en cierre -->
          <Popover
            :open="openMenus[cat.slug]"
            @openChange="val => openMenus[cat.slug] = val"
          >
            <PopoverTrigger asChild>
              <button aria-label="Abrir submenú" class="p-1">
                <ChevronDownIcon class="w-4 h-4 text-gray-500" />
              </button>
            </PopoverTrigger>

            <PopoverContent
              side="bottom"
              align="center"
              :sideOffset="0"
              class="mt-1 w-60 bg-white shadow-lg rounded-lg p-4 z-50"
              @mouseenter="handleMouseEnter(cat.slug)"
              @mouseleave="handleMouseLeave(cat.slug)"
            >
              <!-- Contenido desplegable -->
              <template v-if="hasSubcategorias(cat)">
                <div
                  v-for="sub in cat.children.filter(isSubcategoria)"
                  :key="sub.slug"
                  class="mb-4"
                >
                  <div class="font-semibold text-gray-700 mb-2">
                    {{ sub.nav || sub.slug }}
                  </div>
                  <ul class="ml-2 space-y-1">
                    <li
                      v-for="prod in sub.children || []"
                      :key="prod.slug"
                    >
                      <NuxtLink
                        :to="`/categorias/${sub.slug}/${prod.slug}`"
                        class="text-sm text-gray-600 hover:text-gray-800 block"
                      >
                        {{ prod.title || prod.slug }}
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </template>
              <template v-else-if="hasProductos(cat)">
                <ul class="space-y-2">
                  <li
                    v-for="prod in cat.children.filter(c => c.type === 'producto')"
                    :key="prod.slug"
                  >
                    <NuxtLink
                      :to="`/categorias/${cat.slug}/${prod.slug}`"
                      class="text-sm text-gray-600 hover:text-gray-800 block"
                    >
                      {{ prod.title || prod.slug }}
                    </NuxtLink>
                  </li>
                </ul>
              </template>
            </PopoverContent>
          </Popover>
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { ChevronDownIcon } from 'lucide-vue-next'

const { categorias } = defineProps<{ categorias: any[] }>()

// Estado de apertura de menús y timeouts de cierre
const openMenus = ref<Record<string, boolean>>({})
const closeTimeouts = ref<Record<string, number>>({})

function handleMouseEnter(slug: string) {
  clearTimeout(closeTimeouts.value[slug])
  openMenus.value[slug] = true
}

function handleMouseLeave(slug: string) {
  closeTimeouts.value[slug] = window.setTimeout(() => {
    openMenus.value[slug] = false
  }, 200) // 200ms de retraso para permitir mover el ratón
}

const isSubcategoria = (c: any) => c.type === 'subcategoria'
const hasSubcategorias = (cat: any) =>
  Array.isArray(cat.children) && cat.children.some(isSubcategoria)
const hasProductos = (cat: any) =>
  Array.isArray(cat.children) && cat.children.some((c: any) => c.type === 'producto')
</script>