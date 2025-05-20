<template>
    <nav class="w-full bg-white border-b border-gray-200">
      <ul class="flex space-x-8 px-6 py-4">
        <li
          v-for="categoria in categorias"
          :key="categoria.slug"
          class="relative group"
        >
          <!-- Botón del menú padre con ícono -->
          <button
            class="inline-flex items-center text-sm font-semibold text-gray-800 hover:text-black transition"
          >
            {{ categoria.nav || categoria.slug }}
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
  
          <!-- Panel desplegable -->
          <div
            class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200
                   absolute top-full left-0 mt-2 z-50
                   bg-white border border-gray-200 shadow-xl rounded-lg
                   w-screen max-w-2xl px-6 py-6"
          >
            <!-- Cabecera -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <NuxtImg
                  v-if="categoria.image"
                  :src="categoria.image.startsWith('http') ? categoria.image : `/img/categorias/${categoria.image}`"
                  alt=""
                  class="h-10 w-10 object-cover rounded-md"
                />
                <span class="text-base font-semibold text-gray-900 truncate max-w-[18ch]">
                  {{ categoria.nav || categoria.shortTitle || categoria.title || categoria.slug }}
                </span>
              </div>
              <NuxtLink
                :to="categoria.path || `/categorias/${categoria.slug}`"
                class="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
              >
                Ver todo →
              </NuxtLink>
            </div>
  
            <!-- Subcategorías -->
            <div
  v-if="hasSubcategorias(categoria)"
  class="grid grid-cols-2 gap-x-6 gap-y-4"
>
  <div
    v-for="sub in categoria.children.filter(isSubcategoria)"
    :key="sub.slug"
  >
    <NuxtLink
      :to="sub.path || `/categorias/${sub.slug}`"
      class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition"
    >
      <NuxtImg
        v-if="sub.image"
        :src="sub.image.startsWith('http') ? sub.image : `/img/categorias/${sub.image}`"
        alt=""
        class="h-6 w-6 object-cover rounded"
      />
      {{ sub.nav || sub.title || sub.slug }}
    </NuxtLink>

    <!-- Productos dentro de subcategoría -->
    <ul v-if="Array.isArray(sub.children) && sub.children.length" class="mt-1 pl-6 space-y-1 text-xs text-gray-600">
      <li
        v-for="prod in sub.children.filter(isProducto)"
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
  
            <!-- Productos directos de la categoría -->
            <ul
              v-else-if="hasProductos(categoria)"
              class="grid grid-cols-2 gap-y-2 text-xs text-gray-700"
            >
              <li
                v-for="prod in categoria.children.filter(c => c.type === 'producto')"
                :key="prod.slug"
              >
                <NuxtLink
                  :to="prod.path || `/categorias/${categoria.slug}/${prod.slug}`"
                  class="hover:underline"
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

// ✅ Desestructuramos directamente en <script setup>
const { categorias } = defineProps<{ categorias: any[] }>()

const isSubcategoria = (c: any) => c.type === 'subcategoria'
const isProducto = (c: any) => c.type === 'producto'

const hasSubcategorias = (cat: any) =>
  Array.isArray(cat.children) && cat.children.some(isSubcategoria)

const hasProductos = (cat: any) =>
  Array.isArray(cat.children) && cat.children.some(isProducto)
</script>

  