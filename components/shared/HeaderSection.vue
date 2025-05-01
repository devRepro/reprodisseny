<script setup lang="ts">
// Imports
import { NuxtImg } from '#components'
import { withDefaults, defineProps, useSlots } from 'vue'

/**
 * Props del componente HeaderSection
 * @prop image - URL de la imagen que se mostrará a la izquierda (requerido)
 * @prop alt - Texto alternativo para la imagen (opcional)
 * @prop title - Título principal mostrado a la derecha (requerido)
 */
const props = withDefaults(
  defineProps<{
    image: string
    alt?: string
    title: string
  }>(),
  {
    alt: undefined, // se maneja dinámicamente en el template
  }
)

const slots = useSlots()
</script>

<template>
  <section
    class="flex flex-col md:flex-row items-start bg-background text-foreground px-6 pt-8 pb-12 md:px-16 gap-8"
    aria-labelledby="header-title"
  >
    <!-- Imagen a la izquierda -->
    <div class="w-full md:w-1/2">
      <NuxtImg
        :src="props.image"
        :alt="props.alt || `Imagen relacionada con ${props.title}`"
        width="600"
        height="400"
        format="webp"
        class="w-full h-auto rounded-lg object-cover shadow"
        loading="lazy"
      />
    </div>

    <!-- Contenido a la derecha -->
    <div class="w-full md:w-1/2 space-y-6">
      <header>
        <h1
          id="header-title"
          class="text-3xl md:text-4xl font-bold leading-tight tracking-tight"
        >
          {{ props.title }}
        </h1>
      </header>

      <!-- Slot dinámico: descripción + CTA o formulario -->
      <slot name="right" />
    </div>
  </section>
</template>
