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

  return req
    ? z.string().min(1, `El campo ${f.label} es obligatorio`)
    : z.string().optional().nullable()
}

const dynamicSchema = computed(() => {
  const base: Record<string, z.ZodTypeAny> = {
    cantidad: z.coerce.number().min(1, "La cantidad mínima es 1"),
    comentario: z.string().min(1, "La descripción es obligatoria"),
    privacy: z.coerce.boolean().refine((v) => v === true, {
      message: "Debes leer y aceptar la política de privacidad",
    }),
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

async function handleSubmit() {
  // UX: validamos y, si hay error, focuseamos el primer campo inválido
  const res = await form.validate()
  if (!res.valid) {
    const first = Object.keys(res.errors || {})[0]
    if (first) {
      const el = document.querySelector(`[name="${CSS.escape(first)}"]`) as HTMLElement | null
      el?.focus?.()
    }
    return
  }
  await onSubmit()
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
    form.resetForm({ values: initialValues.value })
    fileRef.value = null
  }
})

/** ---- Estilos Figma (inputs / textarea / trigger) ---- */
const fieldLabelCls =
  "text-[16px] leading-[22.4px] font-normal text-[#1E1E1E]"
const controlBaseCls =
  "h-[43px] rounded-[10px] border border-[#A2A2A2] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] focus-visible:ring-0 focus-visible:border-[#1E1E1E] text-[16px] leading-[22.4px]"
const textareaCls =
  "min-h-[128px] rounded-[10px] border border-[#A2A2A2] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] resize-none placeholder:text-[#A2A2A2] text-[16px] leading-[22.4px] focus-visible:ring-0 focus-visible:border-[#1E1E1E]"
</script>

<template>
  <!-- Frame 102 (derecha) -->
  <section class="w-full">
    <form class="w-full flex flex-col gap-[12px]" @submit.prevent="handleSubmit" novalidate>
      <!-- Bloque intro (Frame 102 top, pb 16, gap 8) -->
      <div class="flex flex-col gap-[8px] pb-[16px]">
        <p class="text-[16px] leading-[22.4px] font-normal text-[#1E1E1E]">
          Rellena el formulario para pedir tu presupuesto. Si algún punto no queda claro, no te preocupes,
          alguien de nuestro equipo te puede asesorar.
        </p>
      </div>

      <!-- Campos: layout vertical, gap 12 -->
      <div class="flex flex-col gap-[12px]">
        <!-- Cantidad -->
        <FormField v-slot="{ componentField }" name="cantidad">
          <FormItem class="flex flex-col gap-[4px]">
            <FormLabel :class="fieldLabelCls">Cantidad</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                name="cantidad"
                type="number"
                min="1"
                inputmode="numeric"
                :class="controlBaseCls"
                autocomplete="off"
              />
            </FormControl>
            <FormMessage class="text-xs" />
          </FormItem>
        </FormField>

        <!-- Extras dinámicos: uno debajo del otro (como Figma) -->
        <template v-for="field in extraFieldsFiltered" :key="field.name">
          <FormField v-slot="{ componentField }" :name="field.name">
            <FormItem class="flex flex-col gap-[4px]">
              <FormLabel :class="fieldLabelCls">{{ field.label }}</FormLabel>

              <FormControl>
                <!-- Select -->
                <Select v-if="field.type === 'select'" v-bind="componentField">
                  <SelectTrigger :class="controlBaseCls">
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
                  v-bind="componentField"
                  :name="field.name"
                  :type="field.type === 'number' ? 'number' : 'text'"
                  :inputmode="field.type === 'number' ? 'numeric' : undefined"
                  :placeholder="field.placeholder || ''"
                  :class="controlBaseCls"
                  :autocomplete="field.name === 'email' ? 'email' : 'off'"
                />
              </FormControl>

              <FormMessage class="text-xs" />
            </FormItem>
          </FormField>
        </template>

        <!-- Descripción -->
        <FormField v-slot="{ componentField }" name="comentario">
          <FormItem class="flex flex-col gap-[4px]">
            <FormLabel :class="fieldLabelCls">Descripción</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                name="comentario"
                :class="textareaCls"
                placeholder="Qué necesitas, cantidad aproximada, medidas, ¿tienes diseño?..."
                rows="5"
              />
            </FormControl>
            <FormMessage class="text-xs" />
          </FormItem>
        </FormField>

        <!-- Adjuntar archivo (Frame 107) -->
        <div class="flex flex-col gap-[8px] pt-[16px]">
          <div class="text-[16px] leading-[22.4px] font-normal text-[#1E1E1E]">
            Adjuntar archivo (opcional)
          </div>

          <div class="flex flex-row items-center gap-[16px]">
            <input
              type="file"
              ref="fileInputRef"
              class="hidden"
              @change="onPickFile"
              accept=".pdf,.jpg,.jpeg,.png,.ai,.zip"
            />

            <!-- Botón seleccionar archivo (Frame 105) -->
            <button
              type="button"
              @click="triggerFileSelect"
              class="h-[28px] px-[10px] rounded-[5px] border border-[#3F3F3F] bg-white inline-flex items-center justify-center"
            >
              <span class="text-[14px] leading-[19.6px] font-normal text-black">
                Seleccionar archivo
              </span>
            </button>

            <span class="text-[14px] leading-[19.6px] font-normal text-[#A2A2A2] truncate">
              {{ fileName }}
            </span>
          </div>
        </div>

        <!-- Privacidad (Frame 103) -->
        <FormField v-slot="{ value, handleChange }" name="privacy">
          <FormItem class="pt-[20px]">
            <div class="flex flex-row items-center gap-[8px]">
              <FormControl>
                <Checkbox
                  :checked="value === true"
                  @update:checked="(v) => handleChange(v === true)"
                  class="w-[20px] h-[20px] border border-[#A2A2A2] rounded-[5px] data-[state=checked]:bg-black data-[state=checked]:text-white"
                />
              </FormControl>

              <FormLabel
                class="text-[14px] leading-[19.6px] font-normal text-black cursor-pointer select-none"
                @click="handleChange(!(value === true))"
              >
                He leído y acepto la política de privacidad.
              </FormLabel>
            </div>
            <FormMessage class="text-xs mt-1" />
          </FormItem>
        </FormField>

        <!-- Mensajes -->
        <div
          v-if="error"
          class="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {{ error }}
        </div>
        <div
          v-if="success"
          class="rounded-[10px] border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
          role="status"
          aria-live="polite"
        >
          Solicitud enviada correctamente.
        </div>

        <!-- Botón (w 556, h 38, radius 8) -->
        <Button
          type="submit"
          class="w-full h-[38px] rounded-[8px] bg-[#0076B3] hover:bg-[#005a8d] text-white text-[16px] leading-[22.4px] font-normal"
          :disabled="isLoading"
          :aria-busy="isLoading ? 'true' : 'false'"
        >
          <span v-if="isLoading">Enviando…</span>
          <span v-else>Contacta con un experto</span>
        </Button>
      </div>
    </form>
  </section>
</template>
