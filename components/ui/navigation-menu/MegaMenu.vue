<template>
  <nav class="w-full bg-white border-b border-gray-200">
    <ul class="flex space-x-8 px-6 py-4">
      <li v-for="cat in categorias" :key="cat.path" class="relative group">
        <button
          class="inline-flex items-center text-sm font-semibold text-gray-800 hover:text-black transition"
          type="button"
        >
          {{ cat.label }}
          <svg
            class="ml-1 w-4 h-4 text-gray-500 group-hover:text-gray-800 transition"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200
                 absolute top-full left-0 mt-2 z-50
                 bg-white border border-gray-200 shadow-xl rounded-lg
                 w-screen max-w-2xl px-6 py-6"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3 min-w-0">
              <span class="text-base font-semibold text-gray-900 truncate">
                {{ cat.label }}
              </span>
            </div>

            <NuxtLink
              :to="cat.path"
              class="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
            >
              Ver todo →
            </NuxtLink>
          </div>

          <!-- Subcategorías -->
          <div v-if="hasSubcats(cat)" class="grid grid-cols-2 gap-x-6 gap-y-4">
            <div v-for="sub in cat.children" :key="sub.path">
              <NuxtLink
                :to="sub.path"
                class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition"
              >
                {{ sub.label }}
              </NuxtLink>

              <!-- Productos “preview” de esa subcategoría -->
              <ul v-if="sub.products?.length" class="mt-1 pl-6 space-y-1 text-xs text-gray-600">
                <li v-for="prod in sub.products" :key="prod.path">
                  <NuxtLink
                    :to="prod.path"
                    class="hover:underline block"
                  >
                    {{ prod.title }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>

          <!-- Productos directos de la categoría (si no hay subcats) -->
          <ul
            v-else-if="cat.products?.length"
            class="grid grid-cols-2 gap-y-2 text-xs text-gray-700"
          >
            <li v-for="prod in cat.products" :key="prod.path">
              <NuxtLink
                :to="prod.path"
                class="hover:underline"
              >
                {{ prod.title }}
              </NuxtLink>
            </li>
          </ul>

          <!-- Fallback -->
          <p v-else class="text-xs text-gray-500">
            Próximamente…
          </p>
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {useCategoriasNav } from "~/composables/useCategoriasNav";

const { data } = await useCategoriasNav({ productLimit: 6 });
const categorias = computed(() => data.value?.tree || []);

const hasSubcats = (cat: any) => Array.isArray(cat.children) && cat.children.length > 0;
</script>
