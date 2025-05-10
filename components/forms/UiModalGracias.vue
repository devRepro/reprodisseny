<!-- components/ui/modal/UiModalGracias.vue -->
<template>
    <Dialog :open="open" @update:open="emit('close')">
      <DialogContent class="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>¡Gracias por tu solicitud!</DialogTitle>
          <DialogDescription>
            Hemos recibido tu petición correctamente.<br />
            En breve uno de nuestros especialistas te contactará por correo o teléfono.
          </DialogDescription>
        </DialogHeader>
  
        <div class="pt-4">
          <Button class="w-full" @click="emit('close')">Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  </template>
  
  <script setup lang="ts">
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from '@/components/ui/dialog'
  import { Button } from '@/components/ui/button'
  
  const props = defineProps<{ open: boolean }>()
  const emit = defineEmits(['close'])
  </script>
  