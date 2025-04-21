<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toFormValidator } from '@vee-validate/zod'
import { ref } from 'vue'
import { Input } from '@shadcn/ui'
import { Checkbox } from '@shadcn/ui'
import { Button } from '@shadcn/ui'

// 1) Definimos el esquema Zod
const newsletterSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  consent: z.boolean().optional(),
})

// 2) Configuramos vee-validate con Zod
const { handleSubmit, errors, resetForm, isSubmitting } = useForm({
  validationSchema: toFormValidator(newsletterSchema),
})

const formValues = ref({
  email: '',
  consent: false,
})

// 3) Función de envío
const onSubmit = handleSubmit(async (values) => {
  try {
    // Llamada a tu endpoint (Netlify Function / SendGrid)
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    // feedback al usuario
    alert('¡Gracias por suscribirte!')
    resetForm()
  } catch (e) {
    console.error(e)
    alert('Error al suscribirse. Intenta de nuevo.')
  }
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-4 max-w-md mx-auto">
    <div>
      <Input
        v-model="formValues.email"
        name="email"
        type="email"
        placeholder="Tu email"
        required
        :aria-invalid="!!errors.email"
      />
      <p v-if="errors.email" class="text-red-600 text-sm mt-1">{{ errors.email }}</p>
    </div>

    <div class="flex items-center">
      <Checkbox v-model="formValues.consent" name="consent" id="consent" />
      <label for="consent" class="ml-2 text-sm text-secondary">
        Acepto la política de privacidad
      </label>
    </div>

    <Button type="submit" :disabled="isSubmitting" class="w-full">
      <span v-if="isSubmitting">Enviando…</span>
      <span v-else>Suscribirse</span>
    </Button>
  </form>
</template>
