<template>
  <Form :form="form">
    <form @submit="form.handleSubmit(onSubmit)" class="space-y-4">
      <!-- Campo Nombre -->
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel>Nombre</FormLabel>
          <FormControl>
            <Input v-bind="componentField" placeholder="Tu nombre" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Campo Email -->
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input v-bind="componentField" placeholder="tu@email.com" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Botón -->
      <Button type="submit" class="w-full">Enviar</Button>

      <!-- Feedback -->
      <p v-if="success" class="text-green-600 text-sm">Formulario enviado correctamente.</p>
      <p v-if="error" class="text-red-600 text-sm">Ocurrió un error al enviar el formulario.</p>
    </form>
  </Form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'




// Estado
const success = ref(false)
const error = ref(false)

// Schema con Zod
const schema = toTypedSchema(z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
}))

// Instancia de formulario
const form = useForm({
  validationSchema: schema,
})

// Submit
const onSubmit = async (values: { name: string; email: string }) => {
  success.value = false
  error.value = false

  try {
    const res = await $fetch('/api/contact', {
      method: 'POST',
      body: values,
    })

    if (res.success) success.value = true
    else throw new Error()
  } catch {
    error.value = true
  }
}
</script>
