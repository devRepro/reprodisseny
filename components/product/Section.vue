// components/product/Section.vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// --- 1. Importa el tipo global ---
import type { Producto } from '@/types' // Asegúrate que la ruta sea correcta

// --- 3. Usa el tipo importado en defineProps ---
const props = defineProps<{ items: Producto[] }>()

const sortBy = ref('default')

const sortedItems = computed(() => {
  const itemsToSort = [...props.items]

  switch (sortBy.value) {
    case 'name-asc':
      // Ahora puedes acceder a item.title con seguridad
      return itemsToSort.sort((a, b) => a.title.localeCompare(b.title))
    case 'name-desc':
      return itemsToSort.sort((a, b) => b.title.localeCompare(a.title))
    // case 'price-asc':
    //   // Ahora puedes acceder a item.price directamente (si lo tienes en tus datos)
    //   return itemsToSort.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    // case 'price-desc':
    //   return itemsToSort.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity))
    case 'default':
    default:
      return itemsToSort
  }
})

function getImage(image?: string): string {
  // Ahora puedes acceder a props.items[0].image, etc. con el tipado completo
  return image && image.trim() !== ''
    ? image.startsWith('/')
      ? image
      : `/img/productos/${image}`
    : '/img/productos/mockupProduct.webp'
}
</script>

<template>
  <!-- El template no necesita cambios, ya accede a los campos necesarios -->
  <section aria-labelledby="products-title" class="bg-gray-50 dark:bg-gray-950 py-16">
    <div class="max-w-screen-xl mx-auto px-4 space-y-10">
       <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
         <h2 id="products-title" class="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl shrink-0">
           Explora nuestros productos
         </h2>
         <UiFiltersProduct v-model="sortBy" class="w-full sm:w-auto sm:ml-auto" />
       </div>
       <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
         <Card
           v-for="item in sortedItems"
           :key="item.slug"
           class="group relative flex flex-col overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition-all"
         >
           <CardHeader class="p-0 overflow-hidden">
             <NuxtImg
               :src="getImage(item.image)"
               :alt="item.alt || item.title"
               class="w-full aspect-[3/2] object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
               width="600"
               height="400"
               format="webp"
               sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
               placeholder
             />
           </CardHeader>
           <CardContent class="flex flex-col justify-between flex-grow p-5 space-y-4">
             <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
               {{ item.title }}
             </h3>
             <Button
               size="sm"
               variant="outline"
               class="mt-auto inline-flex items-center gap-2 text-primary-700 dark:text-primary-300 hover:underline"
               :to="item._path || `/productos/${item.slug}`" <!-- Puedes usar item._path si Nuxt Content lo añade -->
             >
               Más información
               <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary-700 dark:text-primary-300 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
               </svg>
             </Button>
           </CardContent>
         </Card>
       </div>
     </div>
   </section>
</template>