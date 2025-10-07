<script setup lang="ts">
import { ref } from "vue";
import { useMagicKeys } from "@vueuse/core";
import { useRouter } from "vue-router";

const search = ref("");
const searchOpen = ref(false);

const keys = useMagicKeys();
const CmdJ = keys["Meta+J"];
if (CmdJ?.value) {
  searchOpen.value = true;
}

const router = useRouter();

function closeSearch() {
  searchOpen.value = false;
}

function goTo(path: string) {
  closeSearch();
  return router.push(path);
}

function handleOpenChange(open: boolean) {
  if (!open) closeSearch();
}
</script>

<template>
  <CommandDialog :open="searchOpen" @update:open="handleOpenChange" class="z-50">
    <h2 class="sr-only">Buscar</h2>

    <CommandInput
      v-model="search"
      autofocus
      placeholder="Buscar productos o categorías..."
      class="px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
    />

    <CommandList>
      <CommandEmpty>No se encontraron resultados</CommandEmpty>

      <CommandGroup heading="Categorías" v-if="results?.categorias?.length">
        <CommandItem v-for="cat in results.categorias" :key="cat.id">
          <div class="w-full px-3 py-2 flex items-center gap-2 text-sm">
            <img :src="cat.image" class="w-6 h-6 object-cover rounded" alt="" />
            <span>{{ cat.nav || cat.title }}</span>
          </div>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Productos" v-if="results?.productos?.length">
        <CommandItem v-for="prod in results.productos" :key="prod.id">
          <div class="w-full px-3 py-2 flex items-center gap-2 text-sm">
            <img :src="prod.image" class="w-6 h-6 object-cover rounded" alt="" />
            <span>{{ prod.title }}</span>
          </div>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>
