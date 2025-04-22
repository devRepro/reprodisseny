<script setup lang="ts">
import { cn } from '@/lib/utils'
import { X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui' // Asegúrate que 'reka-ui' es correcto, o cámbialo por tu librería (ej: Radix Vue)
import { computed, type HTMLAttributes } from 'vue'

// Define props: extiende las props base del componente y permite añadir clases
const props = defineProps<DialogContentProps & { class?: HTMLAttributes['class'] }>()
// Define los eventos que se pueden emitir
const emits = defineEmits<DialogContentEmits>()

// Delega las props, excluyendo 'class' que se maneja manualmente con cn()
const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

// Pasa las props y eventos delegados al componente subyacente de Reka UI/Radix
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal>
    <!-- Capa de fondo oscuro -->
    <DialogOverlay
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <!-- Contenido del Diálogo -->
    <DialogContent
      v-bind="forwarded"
      :class="
        cn(
          // --- Estilos Base del Diálogo ---
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',

          // --- Animaciones Estándar (tailwindcss-animate) ---

          // Estado ABIERTO (Entrada)
          'data-[state=open]:animate-in',    // Activa animación de entrada
          'data-[state=open]:fade-in-0',     // Efecto Fade In
          'data-[state=open]:zoom-in-95',    // Efecto Zoom In
          // Elige UNA dirección de slide (o ninguna):
          // 'data-[state=open]:slide-in-from-left-1/2', // Slide desde la izquierda (50%) - si lo prefieres
          // 'data-[state=open]:slide-in-from-right-1/2', // Slide desde la derecha (50%)
          'data-[state=open]:slide-in-from-top-2', // Slide desde arriba (valor pequeño de escala)
          // 'data-[state=open]:slide-in-from-bottom-2', // Slide desde abajo (valor pequeño de escala)

          // Estado CERRADO (Salida)
          'data-[state=closed]:animate-out',   // Activa animación de salida
          'data-[state=closed]:fade-out-0',    // Efecto Fade Out
          'data-[state=closed]:zoom-out-95',   // Efecto Zoom Out
           // Elige UNA dirección de slide (o ninguna):
          // 'data-[state=closed]:slide-out-to-left-1/2', // Slide hacia la izquierda (50%) - si lo prefieres
          // 'data-[state=closed]:slide-out-to-right-1/2', // Slide hacia la derecha (50%)
          'data-[state=closed]:slide-out-to-top-2', // Slide hacia arriba (valor pequeño de escala)
          // 'data-[state=closed]:slide-out-to-bottom-2', // Slide hacia abajo (valor pequeño de escala)

          // --- Clases Personalizadas ---
          // Permite pasar clases adicionales desde donde se usa el componente
          props.class,
        )"
    >
      <!-- Contenido que se pasará al diálogo -->
      <slot />

      <!-- Botón de Cierre -->
      <DialogClose
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X class="w-4 h-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>