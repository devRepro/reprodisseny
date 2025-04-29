<template>
  <div>
    <h2 v-if="title" class="text-2xl font-semibold mb-4">
      Solicitar información sobre <span class="text-primary">{{ title }}</span>
    </h2>

    <form @submit.prevent="handleSubmit(onSubmit)" class="grid gap-4">
      <!-- Campo: Nombre -->
      <FormField name="nombre" v-slot="{ field }">
        <FormItem>
          <FormLabel>Nombre</FormLabel>
          <FormControl>
            <Input v-bind="field" placeholder="Tu nombre" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Campo: Email -->
      <FormField name="email" v-slot="{ field }">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input v-bind="field" type="email" placeholder="correo@mail.com" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Campo: Comentario -->
      <FormField name="comentario" v-slot="{ field }">
        <FormItem>
          <FormLabel>Mensaje</FormLabel>
          <FormControl>
            <Input v-bind="field" type="text" placeholder="Mensaje adicional (opcional)" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button type="submit" class="mt-4">Enviar solicitud</Button>
    </form>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>()

import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
</script>
