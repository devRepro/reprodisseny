<template>
  <div>
    <h2 v-if="title" class="text-2xl font-semibold mb-4">
      Solicitar información sobre <span class="text-primary">{{ title }}</span>
    </h2>

    <form @submit.prevent="handleSubmit(onSubmit)" class="grid gap-4">
      <!-- Campos fijos -->
      <FormField name="nombre" v-slot="{ field }">
        <FormItem>
          <FormLabel>Nombre</FormLabel>
          <FormControl>
            <Input v-bind="field" placeholder="Tu nombre completo" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField name="email" v-slot="{ field }">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input v-bind="field" type="email" placeholder="correo@mail.com" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Campos dinámicos -->
      <template v-for="field in dynamicFields" :key="field.name">
        <FormField :name="field.name" v-slot="{ field: f }">
          <FormItem>
            <FormLabel :for="field.name">{{ field.label }}</FormLabel>
            <FormControl>
              <component
                :is="getInputComponent(field)"
                v-bind="f"
                :id="field.name"
                :type="field.type === 'number' ? 'number' : 'text'"
                :options="field.options"
                :placeholder="field.label"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </template>

      <Button type="submit" class="mt-4 w-fit">Enviar solicitud</Button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

type FieldType = 'text' | 'number' | 'select'

interface ProductFormField {
  label: string
  name: string
  type: FieldType
  required: boolean
  options?: string[]
}

const props = defineProps<{
  title?: string
  formFields?: ProductFormField[]
}>()

const dynamicFields = computed(() => props.formFields ?? [])

const dynamicSchema = computed(() => {
  const base = {
    nombre: z.string().min(2, 'El nombre es obligatorio'),
    email: z.string().email('Email inválido'),
  }

  const dynamic: Record<string, z.ZodTypeAny> = {}

  dynamicFields.value.forEach((field) => {
    if (field.type === 'number') {
      dynamic[field.name] = field.required
        ? z.coerce.number({ invalid_type_error: 'Debe ser un número' })
        : z.coerce.number().optional()
    } else if (field.type === 'select') {
      dynamic[field.name] = field.required
        ? z.string().min(1, 'Selecciona una opción')
        : z.string().optional()
    } else {
      dynamic[field.name] = field.required
        ? z.string().min(1, 'Este campo es obligatorio')
        : z.string().optional()
    }
  })

  return toTypedSchema(z.object({ ...base, ...dynamic }))
})

const { handleSubmit } = useForm({
  validationSchema: dynamicSchema,
})

const onSubmit = (values: Record<string, any>) => {
  console.log('✅ Datos del formulario:', values)
}

// Devuelve el componente correcto para cada tipo
function getInputComponent(field: ProductFormField) {
  if (field.type === 'select') {
    return defineComponent({
      props: ['modelValue', 'options'],
      emits: ['update:modelValue'],
      template: `
        <Select v-model="modelValue">
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="opt in options"
              :key="opt"
              :value="opt"
            >
              {{ opt }}
            </SelectItem>
          </SelectContent>
        </Select>
      `
    })
  }
  return Input
}
</script>
