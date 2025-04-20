<template>
  <Form @submit="onSubmit" class="space-y-4">
    <FormField name="name">
      <FormLabel>Nombre</FormLabel>
      <FormControl>
        <Input v-model="form.name" placeholder="Tu nombre" />
      </FormControl>
      <FormMessage />
    </FormField>

    <FormField name="email">
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input v-model="form.email" type="email" placeholder="tu@correo.com" />
      </FormControl>
      <FormMessage />
    </FormField>

    <FormField name="message">
      <FormLabel>Mensaje</FormLabel>
      <FormControl>
        <Textarea v-model="form.message" rows="4" placeholder="Cuéntanos tu proyecto..." />
      </FormControl>
      <FormMessage />
    </FormField>

    <Button type="submit" class="w-full">Enviar consulta</Button>
  </Form>
</template>

<script setup lang="ts">
// npm install @shadcn/ui
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { reactive } from 'vue'

const form = reactive({ name: '', email: '', message: '' })
const onSubmit = () => {
  // TODO: implementar envío de datos (API/Email)
  console.log('Inquiry:', form)
  form.name = ''
  form.email = ''
  form.message = ''
}
</script>

---
**Notas de implementación:**
- Cada componente delega la lógica de datos y validación a composables o al padre.
- Se utilizan componentes de shadcn para mantener coherencia visual, accesibilidad y rendimiento.
- Propiedades y eventos están pensados para maximizar reusabilidad y testabilidad.
