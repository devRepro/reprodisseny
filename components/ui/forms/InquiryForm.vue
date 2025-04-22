<template>
  <Form @submit="onSubmit" class="space-y-4 max-w-md mx-auto">
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
import { Form, FormField, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toFormValidator } from '@vee-validate/zod'
import { reactive } from 'vue'

const schema = z.object({ name: z.string().min(1), email: z.string().email(), message: z.string().min(5) })
const { handleSubmit, resetForm } = useForm({ validationSchema: toFormValidator(schema) })
const form = reactive({ name: '', email: '', message: '' })

const onSubmit = handleSubmit((values) => {
  // llamada API
  console.log('Inquiry sent:', values)
  resetForm()
})
</script>