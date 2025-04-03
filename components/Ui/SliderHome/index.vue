<template>
    <div class="relative overflow-hidden" ref="emblaRef">
      <div class="flex transition-transform duration-150 ease-in-out">
  
        <!-- Slide 1: imagen izquierda -->
        <div class="min-w-full grid grid-cols-2 h-[350px]">
          <!-- Imagen -->
          <div class="h-[400px] overflow-hidden">
            <img src="/img/sliderHome/LibrosRepro.webp" class="w-full h-full object-cover" />
          </div>
          <!-- Texto -->
          <div class="h-[400px] bg-[#1a78b3] flex items-center justify-center p-8">
            <h1 class="text-white text-3xl font-bold text-center leading-snug max-w-[500px]">
              Cuidamos los detalles.<br />
              Nos gusta el <span class="font-bold">trabajo bien hecho.</span>
            </h1>
          </div>
        </div>
  
        <!-- Slide 2: imagen derecha -->
        <div class="min-w-full grid grid-cols-2 h-[400px]">
          <div class="h-[400px] bg-[#1a78b3] flex items-center justify-center p-8">
            <h1 class="text-white text-3xl font-bold text-center leading-snug max-w-[500px]">
              Somos <span class="font-bold">expertos en la impresión.</span><br />
              Más de 40 años de experiencia nos avalan.
            </h1>
          </div>
          <div class="h-[400px] overflow-hidden">
            <img src="/img/sliderHome/OperarioRepro.webp" class="w-full h-full object-cover" />
          </div>
        </div>
  
        <!-- Slide 3: imagen izquierda -->
        <div class="min-w-full grid grid-cols-2 h-[400px]">
          <div class="h-[400px] overflow-hidden">
            <img src="/img/sliderHome/PantoneRepro.webp" class="w-full h-full object-cover" />
          </div>
          <div class="h-[400px] bg-[#1a78b3] flex items-center justify-center p-8">
            <h1 class="text-white text-3xl font-bold text-center leading-snug max-w-[500px]">
              Dominamos el color y tenemos <br />
              <span class="font-bold">certificado ISO en calidad.</span>
            </h1>
          </div>
        </div>
  
        <!-- Slide 4 -->
        <div class="min-w-full grid grid-cols-2 h-[400px]">
          <div class="h-[400px] bg-[#1a78b3] flex items-center justify-center p-8">
            <h1 class="text-white text-3xl font-bold text-center leading-snug max-w-[500px]">
              Expertos en <span class="font-bold">comunicación visual.</span><br />
              Diseño, impresión y montaje
            </h1>
          </div>
          <div class="h-[400px] overflow-hidden">
            <img src="/img/sliderHome/PLVRepro.webp" class="w-full h-full object-cover" />
          </div>
        </div>
  
        <!-- Slide 5 -->
        <div class="min-w-full grid grid-cols-2 h-[400px]">
          <div class="h-[400px] overflow-hidden">
            <img src="/img/sliderHome/SpeedRepro.webp" class="w-full h-full object-cover" />
          </div>
          <div class="h-[400px] bg-[#1a78b3] flex items-center justify-center p-8">
            <h1 class="text-white text-3xl font-bold text-center leading-snug max-w-[500px]">
              Disponemos de <span class="font-bold">maquinaria de última generación</span><br />
              para ofrecerte la mejor calidad
            </h1>
          </div>
        </div>
  
      </div>
  
      <!-- Flechas -->
      <button
        @click="scrollPrev"
        class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-[#333333] rounded-full w-5 h-5 flex items-center justify-center shadow transition"
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        @click="scrollNext"
        class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-[#333333] rounded-full w-5 h-5 flex items-center justify-center shadow transition"
        aria-label="Siguiente"
      >
        ›
      </button>
    </div>
  </template>
    
    <script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue'
    import EmblaCarousel from 'embla-carousel'
    import type { EmblaCarouselType } from 'embla-carousel'
    
    const emblaRef = ref<HTMLElement | null>(null)
    const emblaApi = ref<EmblaCarouselType | null>(null)
    const autoplayInterval = ref<NodeJS.Timeout | null>(null)
    
    const scrollPrev = () => emblaApi.value?.scrollPrev()
    const scrollNext = () => emblaApi.value?.scrollNext()
    
    const startAutoplay = () => {
      stopAutoplay() // reiniciar si ya estaba activo
      autoplayInterval.value = setInterval(() => {
        emblaApi.value?.scrollNext()
      }, 5000)
    }
    
    const stopAutoplay = () => {
      if (autoplayInterval.value) {
        clearInterval(autoplayInterval.value)
        autoplayInterval.value = null
      }
    }
    
    onMounted(() => {
      if (emblaRef.value) {
        emblaApi.value = EmblaCarousel(emblaRef.value, {
          loop: true,
          align: 'start',
        })
    
        startAutoplay()
      }
    })
    
    // Detener autoplay al desmontar el componente
    onUnmounted(() => {
      emblaApi.value?.destroy()
      stopAutoplay()
    })
    </script>
    