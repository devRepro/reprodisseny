<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useSendLead } from '@/composables/useSendLead'

// 👇 importa explícito por si el auto-registro no tiene prefix:""
import {
  FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  producto: string
  extraFields?: Array<{
    name: string
    label: string
    type?: string
    placeholder?: string
    required?: boolean
    options?: string[]
  }>
}>()

const extraFields = computed(() => props.extraFields || [])

const dynamicSchema = computed(() => {
  const base = {
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    email: z.string().email('Correo inválido'),
  }
  const extras = Object.fromEntries(
    extraFields.value.map(f => [
      f.name,
      (f.required ? z.string().min(1, `El campo ${f.label} es obligatorio`) : z.string().optional())
    ])
  )
  return toTypedSchema(z.object({ ...base, ...extras }))
})

const { handleSubmit, resetForm } = useForm({
  validationSchema: dynamicSchema,
  initialValues: {
    nombre: '',
    email: '',
    ...Object.fromEntries(extraFields.value.map(f => [f.name, '']))
  }
})

const { sendLead, isLoading, error, success } = useSendLead()

const onSubmit = handleSubmit(async (values) => {
  try {
    error.value = null
    success.value = false
    await sendLead({
      ...values,
      producto: props.producto,
      origen: 'product-page',
      utm: useRoute().query as any
    })
    if (success.value) resetForm()
  } catch (_) { /* ya seteamos error en el composable */ }
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="grid gap-4" novalidate>
    <FormField name="nombre" v-slot="{ componentField }">
      <FormItem>
        <FormLabel>Nombre</FormLabel>
        <FormControl>
          <Input v-bind="componentField" autocomplete="name" placeholder="Tu nombre completo" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="email" v-slot="{ componentField }">
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input v-bind="componentField" type="email" autocomplete="email" placeholder="correo@mail.com" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- dinámicos -->
    <FormField v-for="f in extraFields" :key="f.name" :name="f.name" v-slot="{ componentField }">
      <FormItem>
        <FormLabel>{{ f.label }}</FormLabel>
        <FormControl>
          <template v-if="f.type === 'select'">
            <select class="input w-full px-3 py-2 border rounded text-sm" v-bind="componentField">
              <option disabled value="">Selecciona una opción</option>
              <option v-for="opt in f.options || []" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </template>
          <template v-else>
            <Input v-bind="componentField" :type="f.type || 'text'" :placeholder="f.placeholder || ''" />
          </template>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" :disabled="isLoading" class="mt-4 w-fit">
      {{ isLoading ? 'Enviando…' : 'Enviar solicitud' }}
    </Button>

    <p v-if="error" class="text-sm font-medium text-destructive mt-2">{{ error }}</p>
    <p v-if="success" class="text-sm font-medium text-emerald-600 mt-2">¡Solicitud enviada con éxito!</p>
  </form>
</template>
