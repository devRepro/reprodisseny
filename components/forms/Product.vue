<!-- components/QuoteForm.vue -->
<template>
  <AutoForm
    :schema="schema"
    :initial-values="{ producto: producto }"
    @submit="onSubmit"
    class="space-y-5"
    :formProps="{ noValidate: true }"
  >
    <template #campo-nombre>
      <FormField name="nombre" v-slot="{ field, error }">
        <FormItem>
          <FormLabel>Nombre completo</FormLabel>
          <FormControl>
            <Input v-bind="field" placeholder="Tu nombre" id="nombre" />
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>
    </template>

    <template #campo-email>
      <FormField name="email" v-slot="{ field, error }">
        <FormItem>
          <FormLabel>Correo electrónico</FormLabel>
          <FormControl>
            <Input v-bind="field" type="email" placeholder="tucorreo@ejemplo.com" id="email" />
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>
    </template>

    <template #campo-telefono>
      <FormField name="telefono" v-slot="{ field }">
        <FormItem>
          <FormLabel>Teléfono (opcional)</FormLabel>
          <FormControl>
            <Input v-bind="field" type="tel" placeholder="+34 600 000 000" id="telefono" />
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>
    </template>

    <template #campo-cantidad>
      <FormField name="cantidad" v-slot="{ field }">
        <FormItem>
          <FormLabel>Cantidad</FormLabel>
          <FormControl>
            <Input
              v-bind="field"
              type="number"
              min="1"
              id="cantidad"
            />
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>
    </template>

    <div class="pt-4">
      <Button type="submit" class="w-full">Solicitar presupuesto</Button>
    </div>
  </AutoForm>
</template>

<script setup>
import { z } from 'zod'
import { AutoForm } from '@/components/ui/auto-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const emit = defineEmits(['submit'])

// Definición de esquema Zod para validaciones automáticas
const schema = z.object({
  nombre: z.string().min(1, { message: 'El nombre es obligatorio' }),
  email: z.string().email({ message: 'Correo válido requerido' }),
  telefono: z.string().optional(),
  cantidad: z.number().min(1, { message: 'Mínimo 1 unidad' }),
  producto: z.string().min(1, { message: 'Producto obligatorio' }),
  empresa: z.string().optional(),
  acepta: z.literal(true).refine(v => v === true, { message: 'Debes aceptar la política de privacidad' })
})

function onSubmit(values) {
  emit('submit', values)
}
</script>
