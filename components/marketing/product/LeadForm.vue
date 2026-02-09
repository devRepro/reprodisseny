<!-- components/marketing/product/LeadForm.vue -->
<script setup lang="ts">
import { computed, watch, ref } from "vue"
import { useForm } from "vee-validate"
import { z } from "zod"
import { toTypedSchema } from "@vee-validate/zod"
import { useRoute } from "#imports"

import { usePriceRequests } from "@/composables/usePriceRequests"

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

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
    categorySlug: string // ✅ NECESARIO para /api/price-requests
    extraFields?: ExtraField[]
    productData?: any
  }>(),
  { extraFields: () => [] }
)

const route = useRoute()
const open = ref(false)

// Figma: archivo (guardamos sólo el nombre)
const fileRef = ref<File | null>(null)
const fileName = computed(() => fileRef.value?.name || "Ningún archivo seleccionado")
function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement
  fileRef.value = input.files?.[0] || null
}

const BASE_FIELDS = ["cantidad", "comentario", "privacy", "nombre", "email", "telefono", "empresa"]

const extraFields = computed(() =>
  (props.extraFields || []).filter((f) => !BASE_FIELDS.includes(f.name))
)

function schemaForField(f: { type?: string; required?: boolean; label: string; options?: string[] }) {
  const req = !!f.required

  if (f.type === "number") {
    return req
      ? z.coerce.number().min(0, `El campo ${f.label} es obligatorio`)
      : z.coerce.number().optional().nullable()
  }

  return req
    ? z.string().min(1, `El campo ${f.label} es obligatorio`)
    : z.string().optional().nullable()
}

const dynamicSchema = computed(() => {
  const base: Record<string, z.ZodTypeAny> = {
    // visibles
    cantidad: z.coerce.number().min(1, "La cantidad mínima es 1"),
    comentario: z.string().min(1, "La descripción es obligatoria"),
    privacy: z.literal(true, { errorMap: () => ({ message: "Debes aceptar la política de privacidad" }) }),

    // dialog
    nombre: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Correo inválido"),
    telefono: z.string().optional().nullable(),
    empresa: z.string().optional().nullable(),
  }

  for (const f of extraFields.value) base[f.name] = schemaForField(f)
  return toTypedSchema(z.object(base))
})

const initialExtraValues = computed(() =>
  Object.fromEntries(extraFields.value.map((f) => [f.name, ""]))
)

const { handleSubmit, resetForm, validateField, setFieldTouched } = useForm({
  validationSchema: dynamicSchema,
  initialValues: {
    cantidad: 1,
    comentario: "",
    privacy: false,

    nombre: "",
    email: "",
    telefono: "",
    empresa: "",

    ...initialExtraValues.value,
  },
})

watch(extraFields, () => {
  resetForm({
    values: {
      cantidad: 1,
      comentario: "",
      privacy: false,
      nombre: "",
      email: "",
      telefono: "",
      empresa: "",
      ...initialExtraValues.value,
    },
  })
})

const { sendPriceRequest, isLoading, error, success } = usePriceRequests()

// Valida visibles + extras y abre dialog
async function openDialog() {
  error.value = null
  success.value = false

  const fieldsToCheck = [
    "cantidad",
    "comentario",
    "privacy",
    ...extraFields.value.map((f) => f.name),
  ]

  let ok = true
  for (const name of fieldsToCheck) {
    setFieldTouched(name as any, true, true)
    const res = await validateField(name as any)
    if (!res.valid) ok = false
  }

  if (ok) open.value = true
}

const onSubmit = handleSubmit(async (values) => {
  error.value = null
  success.value = false

  const slug = Array.isArray(route.params.slug)
    ? route.params.slug.at(-1)
    : String(route.params.slug || "")

  // extras dinámicos
  const extras: Record<string, unknown> = {}
  for (const f of extraFields.value) extras[f.name] = (values as any)[f.name]
  extras.cantidad = values.cantidad
  if (fileRef.value?.name) extras.attachedFileName = fileRef.value.name

  const productPayload = {
    name: props.producto,
    slug,
    sku: props.productData?.sku ?? props.productData?.meta?.sku ?? null,
    url: route.fullPath,
  }

  await sendPriceRequest({
    website: null, // honeypot
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
    resetForm()
    fileRef.value = null
  }
})
</script>

<template>
  <!-- Ojo: usamos UN único form, y el botón de enviar del diálogo hace submit -->
  <form class="w-full" @submit.prevent="onSubmit">
    <div class="rounded-[12px] border border-[#E6E6E6] bg-white p-6">
      <h3 class="text-[20px] leading-[28px] font-semibold text-[#1E1E1E]">
        Solicitar presupuesto
      </h3>

      <div class="mt-6 space-y-6">
        <!-- Cantidad -->
        <FormField v-slot="{ componentField }" name="cantidad">
          <FormItem>
            <FormLabel class="text-[14px] text-[#1E1E1E]">Cantidad</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                inputmode="numeric"
                class="h-10"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Comentario -->
        <FormField v-slot="{ componentField }" name="comentario">
          <FormItem>
            <FormLabel class="text-[14px] text-[#1E1E1E]">Descripción</FormLabel>
            <FormControl>
              <Textarea
                rows="4"
                class="min-h-[110px]"
                placeholder="Explícanos qué necesitas (medidas, material, acabados, plazos...)"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Extras dinámicos -->
        <template v-for="f in extraFields" :key="f.name">
          <FormField v-slot="{ componentField }" :name="f.name">
            <FormItem>
              <FormLabel class="text-[14px] text-[#1E1E1E]">
                {{ f.label }}
              </FormLabel>

              <FormControl>
                <!-- SELECT -->
                <Select v-if="f.type === 'select'" v-bind="componentField">
                  <SelectTrigger class="h-10">
                    <SelectValue :placeholder="f.placeholder || 'Selecciona una opción'" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in (f.options || [])"
                      :key="opt"
                      :value="String(opt)"
                    >
                      {{ opt }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <!-- INPUT number/text -->
                <Input
                  v-else
                  :type="f.type === 'number' ? 'number' : 'text'"
                  :inputmode="f.type === 'number' ? 'numeric' : undefined"
                  class="h-10"
                  :placeholder="f.placeholder || ''"
                  v-bind="componentField"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          </FormField>
        </template>

        <!-- Archivo (no validado por schema, solo guardamos nombre) -->
        <div class="space-y-2">
          <div class="text-[14px] text-[#1E1E1E] font-medium">Adjuntar archivo</div>
          <div class="flex items-center gap-3">
            <input
              type="file"
              class="block w-full text-sm text-[#1E1E1E] file:mr-3 file:rounded-md file:border-0 file:bg-[#F2F2F2] file:px-3 file:py-2 file:text-sm file:text-[#1E1E1E] hover:file:bg-[#EAEAEA]"
              @change="onPickFile"
            />
          </div>
          <div class="text-[12px] text-[#959595]">
            {{ fileName }}
          </div>
        </div>

        <!-- Privacidad -->
        <FormField v-slot="{ value, handleChange }" name="privacy">
          <FormItem class="flex flex-row items-start gap-3 space-y-0">
            <FormControl class="mt-1">
              <Checkbox :checked="value" @update:checked="handleChange" />
            </FormControl>
            <div class="space-y-1 leading-none">
              <FormLabel class="text-[14px] text-[#1E1E1E] font-normal">
                He leído y acepto la política de privacidad
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        </FormField>

        <!-- Mensajes -->
        <div v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ error }}
        </div>
        <div v-if="success" class="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Solicitud enviada correctamente.
        </div>

        <!-- Botón abre dialog (valida visibles) -->
        <Button
          type="button"
          class="w-full h-10"
          :disabled="isLoading"
          @click="openDialog"
        >
          Contacta con un experto
        </Button>
      </div>
    </div>

    <!-- DIALOG con datos de contacto -->
    <Dialog v-model:open="open">
      <DialogContent class="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Datos de contacto</DialogTitle>
        </DialogHeader>

        <div class="mt-4 space-y-5">
          <FormField v-slot="{ componentField }" name="nombre">
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input class="h-10" placeholder="Tu nombre" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input class="h-10" placeholder="tu@email.com" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="telefono">
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input class="h-10" placeholder="Opcional" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="empresa">
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <FormControl>
                <Input class="h-10" placeholder="Opcional" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <DialogFooter class="mt-6">
          <Button type="button" variant="outline" :disabled="isLoading" @click="open = false">
            Cancelar
          </Button>
          <Button type="submit" :disabled="isLoading">
            <span v-if="isLoading">Enviando…</span>
            <span v-else>Enviar</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </form>
</template>
