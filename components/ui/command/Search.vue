<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSearch } from '@/composables/useSearch'
import { useSearchResults } from '@/composables/useSearchResults'
import { onClickOutside } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { Command } from '@/components/ui/command'

const root = ref(null)
const { closeSearch } = useSearch()
const { searchTerm, results, search, filteredCategories, filteredProducts } = useSearchResults()

// Realiza la búsqueda cada vez que el término de búsqueda cambia
onClickOutside(root, () => closeSearch())

// Ejecuta la búsqueda y actualiza los resultados en tiempo real
watch(searchTerm, (value) => {
  search(value)
})

const navigateTo = (path: string) => {
  useRouter().push(path)
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-32 px-4"
  >
    <div
      ref="root"
      class="w-full max-w-[600px] bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] border border-[hsl(var(--border))] rounded-xl shadow-xl"
    >
      <!-- 🔍 BUSCADOR -->
      <Command>
        <div class="relative p-4 pb-2">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Busca productos o categorías..."
            class="w-full p-3 rounded-md border bg-transparent text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
          />
        </div>
      </Command>

      <!-- 🔢 RESUMEN -->
      <div v-if="filteredCategories.length || filteredProducts.length" class="px-4 text-sm text-muted-foreground mb-2">
        {{ filteredCategories.length }} categoría(s), {{ filteredProducts.length }} producto(s) encontrados
      </div>

      <!-- 🧩 CATEGORÍAS -->
      <div v-if="filteredCategories.length" class="px-4 space-y-2 mb-4">
        <h3 class="text-sm font-semibold text-muted-foreground">Categorías</h3>
        <div
          v-for="cat in filteredCategories"
          :key="cat._path"
          @click="navigateTo(cat._path)"
          class="flex items-center gap-4 cursor-pointer hover:bg-[hsl(var(--muted))] rounded-md p-2 transition"
        >
          <img
            :src="cat.image"
            alt=""
            class="w-10 h-10 rounded-md object-cover"
          />
          <span class="text-sm font-medium">{{ cat.title }}</span>
        </div>
      </div>

      <!-- 📦 PRODUCTOS -->
      <div v-if="filteredProducts.length" class="px-4 space-y-2">
        <h3 class="text-sm font-semibold text-muted-foreground">Productos</h3>
        <div v-for="prod in filteredProducts" :key="prod.id" @click="navigateTo(`${prod._path}#${prod.id}`)" class="cursor-pointer hover:bg-[hsl(var(--muted))] rounded-md p-2 transition">
          <img :src="prod.image" alt="" class="w-10 h-10 rounded-md object-cover" />
          <p class="text-sm font-medium">{{ prod.title }}</p>
          <p class="text-xs text-muted-foreground">{{ prod._path }}</p>
        </div>
      </div>

      <!-- ❌ NADA ENCONTRADO -->
      <div v-if="!filteredCategories.length && !filteredProducts.length && searchTerm" class="px-4 py-4 text-center text-sm text-muted-foreground">
        No se encontraron resultados.
      </div>
    </div>
  </div>
</template>
