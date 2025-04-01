<template>
    <UForm
      :schema="schema"
      :state="formState"
      @submit="onSubmit"
      class="space-y-6 p-6 bg-white rounded-md shadow"
    >
      <UFormGroup label="Nombre completo" name="nombre">
        <UInput v-model="formState.nombre" placeholder="Tu nombre" />
      </UFormGroup>
  
      <UFormGroup label="Email" name="email">
        <UInput v-model="formState.email" type="email" placeholder="tucorreo@email.com" />
      </UFormGroup>
  
      <UFormGroup label="Teléfono" name="telefono">
        <UInput v-model="formState.telefono" type="tel" placeholder="+34..." />
      </UFormGroup>
  
        <UFormGroup label="Producto" name="producto">
            <USelect v-model="formState.producto" :options="productos" placeholder="Selecciona un producto" />
        </UFormGroup>
    
        <UFormGroup label="Cantidad" name="cantidad">
            <UInput v-model="formState.cantidad" type="number" min="1" />
        </UFormGroup>
    
        <UFormGroup label="Detalles adicionales (opcional)" name="detalles">
            <UTextarea v-model="formState.detalles" rows="4" />
        </UFormGroup>
  
        <UButton
        type="submit"
        block
        color="primary"
        size="lg"
        >
        Solicitar precio
        </UButton>
  
      <div v-if="success" class="text-green-600 mt-4">✅ Solicitud enviada correctamente</div>
      <div v-if="error" class="text-red-600 mt-4">❌ Hubo un error al enviar tu solicitud</div>
    </UForm>
  </template>
  
  <script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { z } from 'zod'
  import type { FormSubmitEvent } from '#ui/types'
  
  const productos = [
    { label: 'Tarjetas de visita', value: 'tarjetas' },
    { label: 'Vinilos adhesivos', value: 'vinilos' },
    { label: 'Catálogos grapados', value: 'catalogos' }
    // Puedes cargar esto dinámicamente si lo prefieres
  ]
  
  // Esquema de validación con Zod
  const schema = z.object({
    nombre: z.string().min(1, 'Tu nombre es obligatorio'),
    email: z.string().email('Correo electrónico inválido'),
    telefono: z.string().min(6, 'El teléfono es obligatorio'),
    producto: z.string().min(1, 'Selecciona un producto'),
    cantidad: z.coerce.number().min(1, 'La cantidad debe ser mayor a 0'),
    detalles: z.string().optional()
  })
  
  const formState = reactive({
    nombre: '',
    email: '',
    telefono: '',
    producto: '',
    cantidad: 1,
    detalles: ''
  })
  
  const loading = ref(false)
  const success = ref(false)
  const error = ref(false)
  
  const onSubmit = async (event: FormSubmitEvent<typeof schema>) => {
    loading.value = true
    success.value = false
    error.value = false
  
    try {
      // Aquí iría tu lógica de envío, por ejemplo con $fetch o una API externa
      console.log('Datos del formulario:', event.data)
  
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simula espera
  
      success.value = true
    } catch (e) {
      console.error(e)
      error.value = true
    } finally {
      loading.value = false
    }
  }
  </script>
  