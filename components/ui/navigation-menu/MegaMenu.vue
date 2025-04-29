<!-- components/NavMegaMenu.vue -->
<template>
  <nav class="w-full bg-white">
    <ul class="flex space-x-8 px-6 py-4 justify-start">
      <li
        v-for="categoria in categorias"
        :key="categoria.slug"
        class="relative group"
      >
        <!-- Trigger -->
        <button
          class="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
        >
          {{ categoria.nav || categoria.title || categoria.slug }}
        </button>

        <!-- Dropdown panel, sin margen -->
        <div
          class="invisible opacity-0 group-hover:visible group-hover:opacity-100
                 transition-opacity duration-200
                 absolute top-full left-0 z-50
                 bg-white rounded-lg shadow-lg p-6
                 w-screen max-w-4xl mx-auto"
        >
          <!-- Cabecera -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
              <NuxtImg
                v-if="categoria.image"
                :src="categoria.image.startsWith('http')
                  ? categoria.image
                  : `/img/categorias/${categoria.image}`"
                alt=""
                width="48" height="48"
                class="h-12 w-12 rounded-md object-cover"
              />
              <span class="text-lg font-semibold text-gray-900">
                {{ categoria.title || categoria.slug }}
              </span>
            </div>
            <NuxtLink
              :to="categoria.path || `/categorias/${categoria.slug}`"
              class="text-sm font-semibold text-blue-600 hover:underline"
            >
              Ver todo →
            </NuxtLink>
          </div>

          <!-- Subcategorías -->
          <div
            v-if="hasSubcategorias(categoria)"
            class="grid grid-cols-3 gap-6 mb-6"
          >
            <div
              v-for="sub in categoria.children.filter(c => c.type === 'subcategoria')"
              :key="sub.slug"
              class="space-y-2"
            >
              <NuxtLink
                :to="sub.path || `/categorias/${sub.slug}`"
                class="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-md transition"
              >
                <NuxtImg
                  v-if="sub.image"
                  :src="sub.image.startsWith('http')
                    ? sub.image
                    : `/img/categorias/${sub.image}`"
                  alt=""
                  width="32" height="32"
                  class="h-8 w-8 rounded-sm object-cover"
                />
                <span class="text-sm font-medium text-gray-800">
                  {{ sub.nav || sub.title || sub.slug }}
                </span>
                <span class="ml-auto text-xs text-gray-500">
                  ({{ sub.children.filter(c => c.type === 'producto').length }})
                </span>
              </NuxtLink>

              <!-- Productos de la subcategoría -->
              <ul class="mt-1 space-y-1 text-sm text-gray-600">
                <li
                  v-for="prod in sub.children.filter(c => c.type === 'producto')"
                  :key="prod.slug"
                >
                  <NuxtLink
                    :to="prod.path || `/categorias/${sub.slug}/${prod.slug}`"
                    class="hover:underline block"
                  >
                    {{ prod.title || prod.slug }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>

          <!-- Productos directos listados -->
          <ul
            v-if="hasProductos(categoria)"
            class="space-y-2 text-sm text-gray-600"
          >
            <li
              v-for="prod in categoria.children.filter(c => c.type === 'producto')"
              :key="prod.slug"
            >
              <NuxtLink
                :to="prod.path || `/categorias/${categoria.slug}/${prod.slug}`"
                class="hover:underline block"
              >
                {{ prod.title || prod.slug }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCategoriasNav } from '@/composables/useCategoriasNav'

const { data } = await useCategoriasNav()
const categorias = computed(() => data.value?.menuItems || [])

const hasSubcategorias = (cat: any) =>
  cat.children?.some((c: any) => c.type === 'subcategoria')
const hasProductos = (cat: any) =>
  cat.children?.some((c: any) => c.type === 'producto')
</script>