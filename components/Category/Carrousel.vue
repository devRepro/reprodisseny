<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAsyncData } from '#imports'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel'
import { NuxtLink, NuxtImg } from '#components'

// --- Carga de categorías ---
const { data: categories, pending, error } = await useAsyncData(
  'categorias-home',
  async () => {
    return await queryCollection('categorias')
      .where('type', '=', 'categoria')
      .all()
  }
)

if (error.value) console.error('Error cargando categorías:', error.value)

// --- Embla API & estado de indicadores ---
const api = ref<CarouselApi | null>(null)
const current = ref(0)
const count = ref(0)

function setApi(instance: CarouselApi) {
  api.value = instance
}

watch(api, (embla) => {
  if (!embla) return
  // Número de slides
  count.value = embla.scrollSnapList().length
  // Slide actual
  current.value = embla.selectedScrollSnap()
  embla.on('select', () => {
    current.value = embla.selectedScrollSnap()
  })
})

// --- Helper imágenes ---
function resolveImageUrl(src?: string) {
  if (!src) return '/img/placeholder.webp'
  return src.startsWith('/') || src.startsWith('http')
    ? src
    : `/img/categorias/${src}`
}
</script>

<template>
  <section class="relative px-6 py-12">
    <h1 class="text-2xl font-bold mb-8 text-center">Nuestras Categorías</h1>

    <!-- Loading -->
    <div v-if="pending" class="text-center text-gray-500">
      Cargando categorías…
    </div>

    <!-- Carousel con controles -->
    <div v-else-if="categories && categories.length" class="relative">
      <Carousel
        :setApi="setApi"
        :opts="{ align: 'start' }"
        class="w-full"
      >
        <CarouselContent
          class="-ml-4 flex gap-6 snap-x snap-mandatory overflow-x-auto
                 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
        >
          <CarouselItem
            v-for="c in categories"
            :key="c._path"
            class="basis-[260px] md:basis-[280px] flex-shrink-0"
          >
            <div
              class="flex flex-col items-center text-center group"
            >
              <!-- Imagen -->
              <NuxtLink
                :to="c.path || `/categorias/${c.slug}`"
                class="block w-full rounded-lg overflow-hidden border border-gray-200"
              >
                <div class="relative w-full h-[180px] overflow-hidden">
                  <NuxtImg
                    :src="resolveImageUrl(c.image)"
                    :alt="c.alt || c.title"
                    class="w-full h-full object-cover
                           group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    loading="lazy"
                    format="webp"
                    quality="80"
                  />
                </div>
              </NuxtLink>
              <!-- Título -->
              <div class="mt-4">
                <NuxtLink
                  :to="c.path || `/categorias/${c.slug}`"
                  class="text-sm font-semibold text-gray-800 hover:underline transition"
                >
                  {{ c.nav || c.title }}
                </NuxtLink>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>

        <!-- Flechas Prev / Next sólo en desktop -->
        <CarouselPrevious class="hidden md:flex absolute top-1/2 left-0 -translate-y-1/2 ml-2" />
        <CarouselNext class="hidden md:flex absolute top-1/2 right-0 -translate-y-1/2 mr-2" />
      </Carousel>

      <!-- Indicadores (dots) -->
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
