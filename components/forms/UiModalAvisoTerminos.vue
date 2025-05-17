<!-- components/ui/modal/UiModalAvisoTerminos.vue -->
<template>
    <Dialog :open="open" @update:open="emit('close')">
      <DialogContent class="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Falta aceptar los términos</DialogTitle>
          <DialogDescription>
            Para poder enviarte un presupuesto necesitamos que aceptes los términos y condiciones de uso.
          </DialogDescription>
        </DialogHeader>
  
        <div class="pt-4">
          <Button class="w-full" @click="emit('close')">Entendido</Button>
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
  