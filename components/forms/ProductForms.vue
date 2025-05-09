<!-- components/FormsProduct.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  producto: string
  formFields?: {
    label: string
    name: string
    type: 'text' | 'number' | 'select'
    required?: boolean
    options?: string[]
  }[]
}>()

// Estado base + dinámico
const form = ref<Record<string, any>>({
  nombre: '',
  email: '',
  telefono: '',
  cantidad: 1,
  producto: props.producto
})
const emit = defineEmits<{
  (e: 'submit', values: any): void
}>()


function handleSubmit() {
  emit('submit', { ...form.value })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <Input v-model="form.nombre" placeholder="Nombre" />
    <Input v-model="form.email" placeholder="Correo electrónico" type="email" />
    <Input v-model="form.telefono" placeholder="Teléfono (opcional)" />
    <Input v-model="form.cantidad" type="number" min="1" />

    <div class="pt-4">
      <Button type="submit" class="w-full">Solicitar presupuesto</Button>
    </div>
  </form>
</template>
