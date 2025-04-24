<template>
    <form @submit.prevent="submitForm" class="space-y-4">
      <FormField label="Nombre">
        <Input v-model="form.name" placeholder="Nombre completo" />
      </FormField>
  
      <FormField label="Email">
        <Input v-model="form.email" type="email" placeholder="tu@email.com" />
      </FormField>
  
      <FormField label="Mensaje">
        <Textarea v-model="form.message" placeholder="Escribe tu mensaje aquí" rows="4" />
      </FormField>
  
      <Button type="submit">Enviar mensaje</Button>
    </form>
  </template>
  
  <script setup>
  import { Input } from '@/components/ui/input'
  import { Textarea } from '@/components/ui/textarea'
  import { Button } from '@/components/ui/button'
  import { FormField } from '@/components/ui/form'
  
  const form = reactive({
    name: '',
    email: '',
    message: ''
  })
  
  function submitForm() {
    console.log('Formulario enviado:', form)
  }
  </script>
  