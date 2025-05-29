<template>
  <div>
    <h2 v-if="title" class="text-2xl font-semibold mb-4">
      Solicitar información sobre <span class="text-primary">{{ title }}</span>
    </h2>

    <form @submit.prevent="handleSubmit(onSubmit)" class="grid gap-4" novalidate>
      <!-- Campo Nombre -->
      <FormField name="nombre" v-slot="{ field, errors }">
        <FormItem>
          <FormLabel>Nombre</FormLabel>
          <FormControl>
            <Input
              v-model="field.value"
              @blur="field.blur"
              :name="field.name"
              placeholder="Tu nombre completo"
              autocomplete="name"
              :aria-invalid="errors.length > 0"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Campo Email -->
      <FormField name="email" v-slot="{ field, errors }">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              v-model="field.value"
              @blur="field.blur"
              :name="field.name"
              type="email"
              placeholder="correo@mail.com"
              autocomplete="email"
              :aria-invalid="errors.length > 0"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button type="submit" :disabled="isLoading" class="mt-4 w-fit">
        {{ isLoading ? 'Enviando...' : 'Enviar solicitud' }}
      </Button>

      <p v-if="error" class="text-sm font-medium text-destructive mt-2">{{ error }}</p>
      <p v-if="success" class="text-sm font-medium text-emerald-600 mt-2">¡Solicitud enviada con éxito!</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'


import { useSendLead } from '@/composables/useSendLead'

const { sendLead, isLoading, error, success } = useSendLead()

const props = defineProps<{
  title?: string
}>()

const simpleSchema = toTypedSchema(
  z.object({
    nombre: z.string().min(1, { message: 'El nombre es obligatorio' }),
    email: z.string().min(1, { message: 'El email es obligatorio' }).email({ message: 'Email inválido' }),
  })
)

const { handleSubmit, resetForm } = useForm({
  validationSchema: simpleSchema,
  initialValues: {
    nombre: '',
    email: '',
  },
})

const onSubmit = async (values: { nombre: string; email: string }) => {
  console.log('✅ Formulario válido. Enviando...', values)

  const payload = {
    ...values,
    producto: props.title || 'Producto desconocido',
  }

  error.value = null
  success.value = false

  await sendLead(payload)

  if (success.value) {
    console.log('✅ Lead enviado')
    resetForm()
  }

  if (error.value) {
    console.error('❌ Error al enviar lead:', error.value)
  }
}
</script>
