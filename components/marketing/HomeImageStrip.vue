<script setup lang="ts">
defineProps<{
  images: {
    src: string;
    alt: string;
    width: number;
    height: number;
    webpSrcset?: string;
    avifSrcset?: string;
    sizes?: string;
  }[];
}>();
</script>

<template>
  <div class="space-y-4 md:space-y-5">
    <div
      class="-mx-6 w-[calc(100%+3rem)] overflow-x-auto overscroll-x-contain [scrollbar-width:thin] md:mx-0 md:w-auto md:overflow-visible"
    >
      <div
        class="flex snap-x snap-mandatory gap-4 px-6 pb-3 md:grid md:snap-none md:grid-cols-2 md:gap-5 md:px-0 md:pb-0 xl:grid-cols-4 xl:gap-6"
      >
        <article
          v-for="(img, index) in images"
          :key="`${img.src}-${img.alt}`"
          class="group w-[84%] max-w-[22rem] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 md:w-auto md:max-w-none md:snap-none"
        >
          <picture
            v-if="img.avifSrcset || img.webpSrcset"
            class="block"
          >
            <source
              v-if="img.avifSrcset"
              type="image/avif"
              :srcset="img.avifSrcset"
              :sizes="img.sizes"
            />
            <source
              v-if="img.webpSrcset"
              type="image/webp"
              :srcset="img.webpSrcset"
              :sizes="img.sizes"
            />
            <img
              :src="img.src"
              :alt="img.alt"
              :width="img.width"
              :height="img.height"
              class="aspect-[4/3] w-full object-cover md:transition-transform md:duration-500 md:group-hover:scale-[1.02]"
              :loading="index === 0 ? 'eager' : 'lazy'"
              decoding="async"
              fetchpriority="auto"
            />
          </picture>

          <NuxtImg
            v-else
            :src="img.src"
            :alt="img.alt"
            :width="img.width"
            :height="img.height"
            :sizes="img.sizes || 'xs:84vw md:46vw xl:22vw xxl:330px'"
            quality="80"
            class="aspect-[4/3] w-full object-cover md:transition-transform md:duration-500 md:group-hover:scale-[1.02]"
            :loading="index === 0 ? 'eager' : 'lazy'"
            decoding="async"
            fetchpriority="auto"
          />
        </article>
      </div>
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
