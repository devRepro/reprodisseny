
<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useMagicKeys } from '@vueuse/core'
import { useSearch } from '@/composables/useSearch'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty
} from '@/components/ui/command'
import { useContentSearch } from '@/composables/useContentSearch'

const search = ref('')
const { results, loading } = useContentSearch(search)
const { searchOpen, closeSearch } = useSearch()

// Cmd+J para abrir
const keys = useMagicKeys()
const CmdJ = keys['Meta+J']
CmdJ?.value && (searchOpen.value = true)

// Navegar y cerrar
function goTo(path: string) {
  closeSearch()
  return navigateTo(path)
}

function handleOpenChange(open: boolean) {
  if (!open) closeSearch()
}
</script>

<template>
  <CommandDialog
    :open="searchOpen"
    @update:open="handleOpenChange"
    class="z-50"
  >
    <h2 class="sr-only">Buscar</h2>

    <CommandInput
      v-model="search"
      autofocus
      placeholder="Buscar productos o categorías..."
      class="px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
    />

    <CommandList>
      <CommandEmpty>No se encontraron resultados</CommandEmpty>

      <CommandGroup heading="Categorías" v-if="results.categorias.length">
        <CommandItem
          v-for="cat in results.categorias"
          :key="cat.slug"
          @select="goTo(`/categorias/${cat.slug}`)"
        >
          <div class="w-full px-3 py-2 flex items-center gap-2 text-sm">
            <img :src="cat.image" :alt="cat.alt" class="w-6 h-6 object-cover rounded" />
            <span>{{ cat.title }}</span>
          </div>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Productos" v-if="results.productos.length">
        <CommandItem
          v-for="prod in results.productos"
          :key="prod.slug"
          @select="goTo(`/categorias/${prod.category}/${prod.slug}`)"
        >
          <div class="w-full px-3 py-2 flex items-center gap-2 text-sm">
            <img :src="prod.image" :alt="prod.alt" class="w-6 h-6 object-cover rounded" />
            <span>{{ prod.title }}</span>
          </div>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>

