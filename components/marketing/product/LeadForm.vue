<script setup lang="ts">
import { computed, watch, ref } from "vue"
import { useForm } from "vee-validate"
import { z } from "zod"
import { toTypedSchema } from "@vee-validate/zod"
import { useRoute } from "#imports"
import { usePriceRequests } from "@/composables/usePriceRequests"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ExtraField = {
  name: string
  label: string
  type?: "text" | "number" | "select"
  placeholder?: string
  required?: boolean
  options?: string[]
}

const props = withDefaults(
  defineProps<{
    producto: string
    categorySlug: string
    extraFields?: ExtraField[]
    productData?: any
  }>(),
  { extraFields: () => [] }
)

const route = useRoute()
const open = ref(false) // si tienes modal en otra parte

// Archivo
const fileInputRef = ref<HTMLInputElement | null>(null)
const fileRef = ref<File | null>(null)
const fileName = computed(() => fileRef.value?.name || "Ningún archivo seleccionado")

function triggerFileSelect() {
  fileInputRef.value?.click()
}

function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement
  fileRef.value = input.files?.[0] || null
}

// Extras
const BASE_FIELDS = ["cantidad", "comentario", "privacy", "nombre", "email", "telefono", "empresa"]
const extraFieldsFiltered = computed(() =>
  (props.extraFields || []).filter((f) => !BASE_FIELDS.includes(f.name))
)

function schemaForField(f: ExtraField) {
  const req = !!f.required

  if (f.type === "number") {
    return req
      ? z.coerce.number().min(0, `El campo ${f.label} es obligatorio`)
      : z.coerce.number().optional().nullable()
  }

  // select/text
  return req
    ? z.string().min(1, `El campo ${f.label} es obligatorio`)
    : z.string().optional().nullable()
}

const dynamicSchema = computed(() => {
  const base: Record<string, z.ZodTypeAny> = {
    cantidad: z.coerce.number().min(1, "La cantidad mínima es 1"),
    comentario: z.string().min(1, "La descripción es obligatoria"),

    // ✅ robusto: coerciona y exige true
    privacy: z.coerce.boolean().refine((v) => v === true, {
      message: "Debes leer y aceptar la política de privacidad",
    }),

    // si tienes modal de contacto (fase 2)
    nombre: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Correo inválido"),
    telefono: z.string().optional().nullable(),
    empresa: z.string().optional().nullable(),
  }

  for (const f of extraFieldsFiltered.value) base[f.name] = schemaForField(f)
  return toTypedSchema(z.object(base))
})

const initialExtraValues = computed(() =>
  Object.fromEntries(extraFieldsFiltered.value.map((f) => [f.name, ""]))
)

const initialValues = computed(() => ({
  cantidad: 1,
  comentario: "",
  privacy: false,
  nombre: "",
  email: "",
  telefono: "",
  empresa: "",
  ...initialExtraValues.value,
}))

const form = useForm({
  validationSchema: dynamicSchema,
  initialValues: initialValues.value,
})

watch(extraFieldsFiltered, () => {
  form.resetForm({ values: initialValues.value })
})

const { sendPriceRequest, isLoading, error, success } = usePriceRequests()

// Fase 1: valida visibles y abre modal (si no tienes modal, llama onSubmit directamente)
async function handlePreSubmit() {
  const fieldsToCheck = [
    "cantidad",
    "comentario",
    "privacy",
    ...extraFieldsFiltered.value.map((f) => f.name),
  ]

  let ok = true
  for (const name of fieldsToCheck) {
    form.setFieldTouched(name as any, true, true)
    const res = await form.validateField(name as any)
    if (!res.valid) ok = false
  }

  if (ok) open.value = true
  // Si NO tienes modal, usa:
  // if (ok) onSubmit()
}

const onSubmit = form.handleSubmit(async (values) => {
  const slug = Array.isArray(route.params.slug)
    ? route.params.slug.at(-1)
    : String(route.params.slug || "")

  const extras: Record<string, unknown> = {}
  for (const f of extraFieldsFiltered.value) extras[f.name] = (values as any)[f.name]
  extras.cantidad = values.cantidad
  if (fileRef.value?.name) extras.attachedFileName = fileRef.value.name

  const productPayload = {
    name: props.producto,
    slug,
    sku: props.productData?.sku ?? null,
    url: route.fullPath,
  }

  await sendPriceRequest({
    website: null,
    name: values.nombre,
    email: values.email,
    phone: values.telefono || null,
    company: values.empresa || null,
    message: String(values.comentario || "").trim(),
    categorySlug: props.categorySlug,
    product: productPayload,
    extras,
    consent: values.privacy === true,
    sourceUrl: process.client ? window.location.href : route.fullPath,
    utm: route.query as any,
    initialStatus: "Afegit CRM",
  })

  if (success.value) {
    open.value = false
    form.resetForm({ values: initialValues.value })
    fileRef.value = null
  }
})
</script>

<template>
  <!-- ✅ Responsive wrapper -->
  <section class="w-full">
    <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <form
        class="rounded-2xl border border-[#E6E6E6] bg-white p-4 sm:p-6 lg:p-8 shadow-sm"
        @submit.prevent="handlePreSubmit"
      >
        <div class="flex items-start justify-between gap-4">
          <h3 class="text-[20px] leading-[28px] font-semibold text-[#1E1E1E]">
            Solicitar presupuesto
          </h3>
        </div>

        <!-- Grid responsive: 1 col móvil, 2 col md+ -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Cantidad -->
          <FormField v-slot="{ componentField }" name="cantidad">
            <FormItem class="md:col-span-1">
              <FormLabel class="text-[14px] text-[#1E1E1E]">Cantidad</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  inputmode="numeric"
                  class="h-11 rounded-[10px] border border-[#A2A2A2] focus-visible:ring-0 focus-visible:border-black"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Extras dinámicos -->
          <template v-for="field in extraFieldsFiltered" :key="field.name">
            <FormField v-slot="{ componentField }" :name="field.name">
              <FormItem class="md:col-span-1">
                <FormLabel class="text-[14px] text-[#1E1E1E]">{{ field.label }}</FormLabel>

                <FormControl>
                  <!-- Select -->
                  <Select v-if="field.type === 'select'" v-bind="componentField">
                    <SelectTrigger class="h-11 rounded-[10px] border border-[#A2A2A2]">
                      <SelectValue :placeholder="field.placeholder || 'Selecciona una opción'" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="opt in field.options || []"
                        :key="opt"
                        :value="String(opt)"
                      >
                        {{ opt }}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <!-- Input -->
                  <Input
                    v-else
                    :type="field.type === 'number' ? 'number' : 'text'"
                    :inputmode="field.type === 'number' ? 'numeric' : undefined"
                    class="h-11 rounded-[10px] border border-[#A2A2A2]"
                    :placeholder="field.placeholder || ''"
                    v-bind="componentField"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            </FormField>
          </template>

          <!-- Descripción full width -->
          <FormField v-slot="{ componentField }" name="comentario">
            <FormItem class="md:col-span-2">
              <FormLabel class="text-[14px] text-[#1E1E1E]">Descripción</FormLabel>
              <FormControl>
                <Textarea
                  rows="5"
                  class="min-h-[140px] rounded-[10px] border border-[#A2A2A2] resize-none placeholder:text-[#A2A2A2]"
                  placeholder="Qué necesitas, cantidad aproximada, medidas, ¿tienes diseño?..."
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Archivo full width -->
          <div class="md:col-span-2 space-y-2">
            <div class="text-[14px] text-[#1E1E1E] font-medium">Adjuntar archivo (opcional)</div>

            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="file"
                ref="fileInputRef"
                class="hidden"
                @change="onPickFile"
                accept=".pdf,.jpg,.png,.ai,.zip"
              />

              <button
                type="button"
                @click="triggerFileSelect"
                class="inline-flex items-center justify-center px-3 h-10 border border-[#3F3F3F] rounded-[8px] bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                <span class="text-[14px] text-black">Seleccionar archivo</span>
              </button>

              <span class="text-[13px] text-[#A2A2A2] truncate w-full">
                {{ fileName }}
              </span>
            </div>
          </div>

          <!-- Privacidad full width -->
          <FormField v-slot="{ value, handleChange }" name="privacy">
            <FormItem class="md:col-span-2">
              <div class="flex items-start gap-3">
                <FormControl class="mt-1">
                  <Checkbox
                    :checked="value === true"
                    @update:checked="(v) => handleChange(v === true)"
                    class="w-5 h-5 border border-[#A2A2A2] rounded-[5px] data-[state=checked]:bg-black data-[state=checked]:text-white"
                  />
                </FormControl>

                <div class="min-w-0">
                  <FormLabel
                    class="text-[14px] text-[#1E1E1E] font-normal cursor-pointer select-none"
                    @click="handleChange(!(value === true))"
                  >
                    He leído y acepto la política de privacidad.
                  </FormLabel>
                  <FormMessage class="text-red-500 text-xs mt-1" />
                </div>
              </div>
            </FormItem>
          </FormField>

          <!-- Mensajes full width -->
          <div v-if="error" class="md:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ error }}
          </div>
          <div v-if="success" class="md:col-span-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Solicitud enviada correctamente.
          </div>

          <!-- Botón full width -->
          <div class="md:col-span-2">
            <Button
              type="submit"
              class="w-full h-11 bg-[#0076B3] hover:bg-[#005a8d] text-white rounded-[10px] text-[16px] font-normal"
              :disabled="isLoading"
            >
              <span v-if="isLoading">Enviando…</span>
              <span v-else>Contacta con un experto</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>