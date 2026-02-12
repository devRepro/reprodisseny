<script setup lang="ts">
import { computed } from "vue"
import { Button } from "@/components/ui/button"

type Props = {
  title?: string
  ctaText?: string
  to?: string
  bgImageSrc?: string
  /** Altura del banner (en px) */
  height?: number
  /** Si el CTA debe abrir en nueva pestaña */
  external?: boolean
  /** Quita bordes redondeados si quieres banner 100% edge-to-edge */
  rounded?: boolean
  /**
   * Si quieres forzar NuxtImg (ipx). Por defecto usamos background-image (más fiable).
   */
  useNuxtImg?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: "Cómo preparar tus archivos",
  ctaText: "Ver la guía rápida",
  to: "/guia-impresion",
  bgImageSrc: "/img/ui/archivos.png",
  height: 200,
  external: false,
  rounded: false,
  useNuxtImg: false,
})

const bgSrc = computed(() => {
  const s = String(props.bgImageSrc || "").trim()
  if (!s) return ""
  return s.startsWith("/") ? s : `/${s}`
})

const wrapStyle = computed(() => ({
  height: `${props.height}px`,
  ...(props.useNuxtImg ? {} : { backgroundImage: `url('${bgSrc.value}')` }),
}))
</script>

<template>
  <!-- Full width (edge-to-edge) -->
  <section class="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
    <div
      class="relative w-full overflow-hidden bg-white"
      :class="[
        props.rounded ? 'rounded-[12px]' : '',
        props.useNuxtImg ? '' : 'bg-cover bg-right',
      ]"
      :style="wrapStyle"
    >
      <!-- Fondo con NuxtImg (opcional) -->
      <NuxtImg
        v-if="props.useNuxtImg"
        :src="bgSrc"
        alt=""
        class="absolute inset-0 h-full w-full object-cover"
        sizes="100vw"
        densities="x1 x2"
        loading="lazy"
      />

      <!-- Overlay: blanco izquierda -> transparente derecha -->
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/0" />

      <!-- Contenido centrado -->
      <div class="relative h-full">
        <div class="mx-auto h-full max-w-7xl px-6">
          <div class="flex h-full items-center justify-between gap-6">
            <h2 class="text-[32px] leading-[40px] font-semibold text-[#1E1E1E]">
              {{ title }}
            </h2>

            <Button
              as-child
              class="h-[44px] rounded-full bg-[#0076B3] px-6 text-[16px] font-normal text-white hover:bg-[#005a8d]"
            >
              <NuxtLink
                :to="to"
                :target="external ? '_blank' : undefined"
                :rel="external ? 'noopener noreferrer' : undefined"
              >
                {{ ctaText }}
              </NuxtLink>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
