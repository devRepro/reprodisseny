<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { cn } from '@/lib/utils'
import { resolveImageUrl } from '@/utils/images'
import type { Categoria } from '@/types'
import type { EmblaCarouselType } from 'embla-carousel'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'


// Props
const props = defineProps<{ categories: Categoria[] }>()
const emits = defineEmits<{
  (e: 'update:current', value: number): void
}>()

// Carousel API reference
const embla = ref<EmblaCarouselType | null>(null)
const current = ref(0)
const count = computed(() => props.categories.length)

// Update current index when selection changes
function handleSelect(api: EmblaCarouselType) {
  const idx = api.selectedScrollSnap()
  current.value = idx
  emits('update:current', idx)
}

// Set up event listeners on embla instance
watch(
  embla,
  (api, _prev, onInvalidate) => {
    if (!api) return
    api.on('select', () => handleSelect(api))
    handleSelect(api)
    onInvalidate(() => api.off('select', () => handleSelect(api)))
  },
  { flush: 'post' }
)

// Reset index when categories change
watch(
  () => props.categories,
  () => {
    current.value = 0
  },
  { immediate: true }
)
</script>

<template>
  <section aria-labelledby="carousel-heading" class="relative px-6 py-12">
    <h2 id="carousel-heading" class="sr-only">Categorías</h2>

    <template v-if="count">
      <Carousel
        :setApi="embla"
        :opts="{ align: 'start', skipSnaps: true }"
        class="w-full"
      >
        <CarouselContent class="-ml-4 flex gap-6 snap-x snap-mandatory overflow-x-auto">
          <CarouselItem
            v-for="category in props.categories"
            :key="category.slug"
            class="basis-[260px] md:basis-[280px] flex-shrink-0"
          >
            <NuxtLink
              :to="category.path"
              class="group block w-full rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
              :aria-label="`Ver categoría ${category.title}`"
            >
              <div class="relative w-full h-[180px] overflow-hidden">
                <NuxtImg
                  :src="resolveImageUrl(category.image)"
                  :alt="category.alt ?? category.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                  loading="lazy"
                />
              </div>
              <div class="mt-4 text-center p-2">
                <span
                  class="text-sm font-semibold text-gray-800 group-hover:text-primary"
                >
                  {{ category.nav ?? category.title }}
                </span>
              </div>
            </NuxtLink>
          </CarouselItem>
        </CarouselContent>

        <CarouselPrevious
          aria-label="Anterior categoría"
          class="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10"
        />
        <CarouselNext
          aria-label="Siguiente categoría"
          class="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10"
        />
      </Carousel>

      <!-- Indicadores -->
      <div class="flex justify-center mt-4 space-x-2">
        <button
          v-for="(_, idx) in count"
          :key="idx"
          @click="embla?.scrollTo(idx)"
          :class="cn(
            'w-3 h-3 rounded-full transition-colors duration-200',
            current === idx ? 'bg-primary' : 'bg-gray-300'
          )"
          :aria-label="`Ir a categoría ${idx + 1}`"
          :aria-current="current === idx ? 'true' : undefined"
        />
      </div>
    </template>

    <p v-else class="text-center text-gray-500">
      No hay categorías disponibles.
    </p>
  </section>
</template>
