// /composables/useContactFormSchema.ts
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio').max(100),
  email: z.string().email('Email inválido'),
})

export const typedContactSchema = toTypedSchema(contactSchema)
