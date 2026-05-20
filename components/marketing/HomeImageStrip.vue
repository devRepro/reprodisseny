<script setup lang="ts">
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

defineProps<{
  images: { src: string; alt: string }[];
}>();
</script>

<template>
  <div class="space-y-4 md:space-y-5">
    <!-- Móvil: scroll horizontal elegante -->
    <div class="md:hidden">
      <ScrollArea class="-mx-6 w-[calc(100%+3rem)]">
        <div class="flex snap-x snap-mandatory gap-4 px-6 pb-3">
          <article
            v-for="img in images"
            :key="`${img.src}-${img.alt}`"
            class="w-[84%] max-w-[22rem] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
          >
            <img
              :src="img.src"
              :alt="img.alt"
              class="aspect-[4/3] w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </article>
        </div>

        <ScrollBar orientation="horizontal" class="px-6" />
      </ScrollArea>
    </div>

    <!-- Tablet / desktop: grid estable -->
    <div class="hidden md:grid md:grid-cols-2 md:gap-5 xl:grid-cols-4 xl:gap-6">
      <article
        v-for="img in images"
        :key="`${img.src}-${img.alt}`"
        class="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
      >
        <img
          :src="img.src"
          :alt="img.alt"
          class="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
      </article>
    </div>

    <p
      class="max-w-6xl text-sm italic leading-7 text-primary md:text-base md:leading-7"
    >
      <span class="mr-1 font-semibold not-italic" aria-hidden="true">→</span>
      Si necesitas un
      <span class="font-semibold not-italic">servicio integral</span>,
      no te preocupes, nosotros nos encargamos de todo el proceso:
      <span class="font-semibold not-italic">
        diseño, impresión, instalación y logística.
      </span>
    </p>
  </div>
</template>