<template>
  <form @submit.prevent="handleSubmit(onSubmit)" class="grid gap-4" novalidate>
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

    <!-- Campos dinámicos -->
    <FormField
      v-for="fieldDef in extraFields"
      :key="fieldDef.name"
      :name="fieldDef.name"
      v-slot="{ field, errors }"
    >
      <FormItem>
        <FormLabel>{{ fieldDef.label }}</FormLabel>
        <FormControl>
          <template v-if="fieldDef.type === 'select'">
            <select
              v-model="field.value"
              @blur="field.blur"
              :name="field.name"
              class="input w-full px-3 py-2 border rounded text-sm"
              :aria-invalid="errors.length > 0"
            >
              <option disabled value="">Selecciona una opción</option>
              <option
                v-for="option in fieldDef.options || []"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </template>

          <template v-else>
            <Input
              v-model="field.value"
              @blur="field.blur"
              :name="field.name"
              :type="fieldDef.type || 'text'"
              :placeholder="fieldDef.placeholder || ''"
              :aria-invalid="errors.length > 0"
            />
          </template>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useSendLead } from '@/composables/useSendLead'

const props = defineProps<{
  producto: string
  extraFields?: Array<{
    name: string
    label: string
    type?: string
    placeholder?: string
    required?: boolean
    options?: string[] // solo si es select
  }>
}>()

const extraFields = computed(() => props.extraFields || [])

const dynamicSchema = computed(() => {
  const base = {
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    email: z.string().email('Correo inválido'),
  }

  const extras = Object.fromEntries(
    extraFields.value.map((field) => [
      field.name,
      field.required
        ? z.string().min(1, `El campo ${field.label} es obligatorio`)
        : z.string().optional(),
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
  },
})

const { sendLead, isLoading, error, success } = useSendLead()

const onSubmit = async (values: Record<string, any>) => {
  const payload = {
    ...values,
    producto: props.producto,
  }

  error.value = null
  success.value = false

  await sendLead(payload)

  if (success.value) {
    resetForm()
  }
}
</script>
