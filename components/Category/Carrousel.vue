<script setup lang="ts">
import type { Categoria } from '@/types'

// 1) Recibimos **solo** el prop `categories`
const props = defineProps<{ categories: Categoria[] }>()

// 2) Si necesitas formatear la URL de la imagen, podrías recibir 
//    también un helper por prop o importarlo aquí:
import { resolveImageUrl } from '@/utils/images' // o donde lo tengas

// 3) Datos para los indicadores / carousel:
//    Lo ideal es que el padre te pase también un `count` y 
//    los handlers prev/next, o uses un composable interno.
//    Aquí por simplicidad asumiremos que el padre sólo te pasa `categories`
//    y que tú montas tu propio state local:

import { ref, computed } from 'vue'
const api = ref<any>(null)
const current = ref(0)
const count = computed(() => props.categories.length)

function onSelect(index: number) {
  current.value = index
}
</script>

<template>
  <section class="relative px-6 py-12">
    <h1 class="text-2xl font-bold mb-8 text-center">Nuestras Categorías</h1>

    <!-- Carousel con controles -->
    <div v-if="props.categories.length" class="relative">
      <Carousel
        :setApi="api"
        :opts="{ align: 'start' }"
        class="w-full"
        @select="onSelect"
      >
        <CarouselContent class="-ml-4 flex gap-6 snap-x snap-mandatory overflow-x-auto">
          <CarouselItem
            v-for="c in props.categories"
            :key="c._path"
            class="basis-[260px] md:basis-[280px] flex-shrink-0"
          >
            <NuxtLink :to="c.path" class="block w-full rounded-lg overflow-hidden border">
              <div class="relative w-full h-[180px] overflow-hidden">
                <NuxtImg
                  :src="resolveImageUrl(c.image)"
                  :alt="c.alt || c.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                  loading="lazy"
                />
              </div>
            </NuxtLink>
            <div class="mt-4 text-center">
              <NuxtLink :to="c.path" class="text-sm font-semibold hover:underline">
                {{ c.nav || c.title }}
              </NuxtLink>
            </div>
          </CarouselItem>
        </CarouselContent>

        <CarouselPrevious class="hidden md:flex absolute top-1/2 left-0 -translate-y-1/2 ml-2" />
        <CarouselNext     class="hidden md:flex absolute top-1/2 right-0 -translate-y-1/2 mr-2" />
      </Carousel>

      <!-- Indicadores -->
      <div class="flex justify-center mt-4 space-x-2">
        <button
          v-for="i in count"
          :key="i"
          @click="api?.scrollTo(i - 1)"
          :class="[
            'w-3 h-3 rounded-full transition-colors duration-200',
            current === (i - 1) ? 'bg-primary' : 'bg-gray-400'
          ]"
        />
      </div>
    </div>

    <!-- Fallback si no hay categorías -->
    <p v-else class="text-center text-gray-500">
      No hay categorías disponibles.
    </p>
  </section>
</template>
