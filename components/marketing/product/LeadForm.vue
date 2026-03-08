<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useRoute } from "#imports";
import { usePriceRequests } from "@/composables/usePriceRequests";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExtraField = {
  name: string;
  label: string;
  type?: "text" | "number" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

type NormalizedExtraField = ExtraField & {
  kind: "input" | "select" | "fixed";
  normalizedOptions: string[];
  initialValue: string | number;
};

const props = withDefaults(
  defineProps<{
    producto: string;
    categorySlug: string;
    extraFields?: ExtraField[];
    productData?: any;
  }>(),
  { extraFields: () => [] }
);

const route = useRoute();

const fileInputRef = ref<HTMLInputElement | null>(null);
const fileRef = ref<File | null>(null);
const fileName = computed(() => fileRef.value?.name || "Ningún archivo seleccionado");

function triggerFileSelect() {
  fileInputRef.value?.click();
}

function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement;
  fileRef.value = input.files?.[0] || null;
}

const BASE_FIELDS = [
  "cantidad",
  "comentario",
  "privacy",
  "nombre",
  "email",
  "telefono",
  "empresa",
];

function normalizeExtraField(field: ExtraField): NormalizedExtraField | null {
  const normalizedOptions = (field.options || [])
    .map((opt) => String(opt).trim())
    .filter(Boolean);

  if (field.type === "select") {
    if (normalizedOptions.length === 0) {
      return null;
    }

    if (normalizedOptions.length === 1) {
      return {
        ...field,
        kind: "fixed",
        normalizedOptions,
        initialValue: normalizedOptions[0],
      };
    }

    return {
      ...field,
      kind: "select",
      normalizedOptions,
      initialValue: "",
    };
  }

  return {
    ...field,
    kind: "input",
    normalizedOptions,
    initialValue: "",
  };
}

const normalizedExtraFields = computed<NormalizedExtraField[]>(() =>
  (props.extraFields || [])
    .filter((field) => !BASE_FIELDS.includes(field.name))
    .map(normalizeExtraField)
    .filter((field): field is NormalizedExtraField => Boolean(field))
);

const fixedProductFields = computed(() =>
  normalizedExtraFields.value.filter((field) => field.kind === "fixed")
);

const requiredProductFields = computed(() =>
  normalizedExtraFields.value.filter((field) => field.kind !== "fixed" && field.required)
);

const optionalProductFields = computed(() =>
  normalizedExtraFields.value.filter((field) => field.kind !== "fixed" && !field.required)
);

function normalizeNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}

function emptyToUndefined(value: unknown) {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  return value;
}

function schemaForField(field: NormalizedExtraField) {
  if (field.kind === "fixed") {
    return z.any().optional();
  }

  if (field.type === "number") {
    return field.required
      ? z.preprocess(
          normalizeNumber,
          z
            .number({
              required_error: `El campo ${field.label} es obligatorio`,
              invalid_type_error: `El campo ${field.label} es obligatorio`,
            })
            .min(0, `El campo ${field.label} debe ser mayor o igual a 0`)
        )
      : z.preprocess(normalizeNumber, z.number().optional());
  }

  return field.required
    ? z.preprocess(
        emptyToUndefined,
        z
          .string({
            required_error: `El campo ${field.label} es obligatorio`,
            invalid_type_error: `El campo ${field.label} es obligatorio`,
          })
          .min(1, `El campo ${field.label} es obligatorio`)
      )
    : z.preprocess(emptyToUndefined, z.string().optional());
}

const dynamicSchema = computed(() => {
  const base: Record<string, z.ZodTypeAny> = {
    cantidad: z.preprocess(
      normalizeNumber,
      z
        .number({
          required_error: "La cantidad es obligatoria",
          invalid_type_error: "La cantidad es obligatoria",
        })
        .min(1, "La cantidad mínima es 1")
    ),
    comentario: z.preprocess(
      emptyToUndefined,
      z
        .string({
          required_error: "La descripción es obligatoria",
          invalid_type_error: "La descripción es obligatoria",
        })
        .min(1, "La descripción es obligatoria")
    ),
    privacy: z.literal(true, {
      errorMap: () => ({
        message: "Debes leer y aceptar la política de privacidad",
      }),
    }),
    nombre: z.preprocess(
      emptyToUndefined,
      z
        .string({
          required_error: "El nombre es obligatorio",
          invalid_type_error: "El nombre es obligatorio",
        })
        .min(1, "El nombre es obligatorio")
    ),
    email: z.preprocess(
      emptyToUndefined,
      z
        .string({
          required_error: "El email es obligatorio",
          invalid_type_error: "El email es obligatorio",
        })
        .email("Correo inválido")
    ),
    telefono: z.preprocess(emptyToUndefined, z.string().optional()),
    empresa: z.preprocess(emptyToUndefined, z.string().optional()),
  };

  for (const field of normalizedExtraFields.value) {
    base[field.name] = schemaForField(field);
  }

  return toTypedSchema(z.object(base));
});

const initialExtraValues = computed(() =>
  Object.fromEntries(
    normalizedExtraFields.value.map((field) => [field.name, field.initialValue])
  )
);

const initialValues = computed(() => ({
  cantidad: 1,
  comentario: "",
  privacy: false,
  nombre: "",
  email: "",
  telefono: "",
  empresa: "",
  ...initialExtraValues.value,
}));

const form = useForm({
  validationSchema: dynamicSchema,
  initialValues: initialValues.value,
});

watch(initialValues, (nextValues) => {
  form.resetForm({
    values: nextValues,
    touched: {},
    errors: {},
  });
});

const { sendPriceRequest, isLoading, error, success } = usePriceRequests();

function focusFirstInvalidField(errors: Record<string, string>) {
  const first = Object.keys(errors || {})[0];
  if (!first) return;

  const selector = [
    `[name="${CSS.escape(first)}"]`,
    `[data-field-name="${CSS.escape(first)}"]`,
    `#${CSS.escape(first)}`,
  ].join(", ");

  const el = document.querySelector(selector) as HTMLElement | null;
  el?.focus?.();
}

const onSubmit = form.handleSubmit(
  async (values) => {
    const slug = Array.isArray(route.params.slug)
      ? route.params.slug.at(-1)
      : String(route.params.slug || "");

    const extras: Record<string, unknown> = {};

    for (const field of normalizedExtraFields.value) {
      extras[field.name] = (values as Record<string, unknown>)[field.name];
    }

    extras.cantidad = values.cantidad;

    if (fileRef.value?.name) {
      extras.attachedFileName = fileRef.value.name;
    }

    const productPayload = {
      name: props.producto,
      slug,
      sku: props.productData?.sku ?? null,
      url: route.fullPath,
    };

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
    });

    if (success.value) {
      form.resetForm({
        values: initialValues.value,
        touched: {},
        errors: {},
      });
      fileRef.value = null;

      if (fileInputRef.value) {
        fileInputRef.value.value = "";
      }
    }
  },
  ({ errors }) => {
    focusFirstInvalidField(errors as Record<string, string>);
    console.warn("Formulario inválido:", errors);
  }
);

const fieldLabelCls = "text-[16px] leading-[22.4px] font-normal text-[#1E1E1E]";
const controlBaseCls =
  "h-[43px] rounded-[10px] border border-[#A2A2A2] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] focus-visible:ring-0 focus-visible:border-[#1E1E1E] text-[16px] leading-[22.4px]";
const textareaCls =
  "min-h-[128px] rounded-[10px] border border-[#A2A2A2] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] resize-none placeholder:text-[#A2A2A2] text-[16px] leading-[22.4px] focus-visible:ring-0 focus-visible:border-[#1E1E1E]";
</script>

<template>
  <section class="w-full">
    <form class="flex w-full flex-col gap-[12px]" @submit.prevent="onSubmit" novalidate>
      <div class="flex flex-col gap-[12px]">
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

        <div
          v-if="fixedProductFields.length"
          class="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <p class="text-sm font-medium text-slate-800">
            Configuración incluida en este producto
          </p>

          <ul class="mt-2 flex flex-wrap gap-2">
            <li
              v-for="field in fixedProductFields"
              :key="field.name"
              class="rounded-full bg-white px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200"
            >
              {{ field.label }}: {{ field.initialValue }}
            </li>
          </ul>
        </div>

        <template v-for="field in requiredProductFields" :key="field.name">
          <FormField v-slot="{ componentField, value, handleChange }" :name="field.name">
            <FormItem class="flex flex-col gap-[4px]">
              <FormLabel :class="fieldLabelCls">{{ field.label }}</FormLabel>

              <FormControl>
                <Select
                  v-if="field.kind === 'select'"
                  :model-value="String(value ?? '')"
                  @update:model-value="handleChange"
                >
                  <SelectTrigger :class="controlBaseCls" :data-field-name="field.name">
                    <SelectValue
                      :placeholder="field.placeholder || 'Selecciona una opción'"
                    />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem
                      v-for="opt in field.normalizedOptions"
                      :key="opt"
                      :value="opt"
                    >
                      {{ opt }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  v-else
                  v-bind="componentField"
                  :name="field.name"
                  :type="field.type === 'number' ? 'number' : 'text'"
                  :inputmode="field.type === 'number' ? 'numeric' : undefined"
                  :placeholder="field.placeholder || ''"
                  :class="controlBaseCls"
                  autocomplete="off"
                />
              </FormControl>

              <FormMessage class="text-xs" />
            </FormItem>
          </FormField>
        </template>

        <FormField v-slot="{ componentField }" name="nombre">
          <FormItem class="flex flex-col gap-[4px]">
            <FormLabel :class="fieldLabelCls">Nombre</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                name="nombre"
                type="text"
                :class="controlBaseCls"
                autocomplete="name"
              />
            </FormControl>
            <FormMessage class="text-xs" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem class="flex flex-col gap-[4px]">
            <FormLabel :class="fieldLabelCls">Email</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                name="email"
                type="email"
                :class="controlBaseCls"
                autocomplete="email"
              />
            </FormControl>
            <FormMessage class="text-xs" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="comentario">
          <FormItem class="flex flex-col gap-[4px]">
            <FormLabel :class="fieldLabelCls">Descripción</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                name="comentario"
                :class="textareaCls"
                placeholder="Qué necesitas, medidas aproximadas, fecha de entrega, ¿tienes diseño?..."
                rows="5"
              />
            </FormControl>
            <FormMessage class="text-xs" />
          </FormItem>
        </FormField>

        <details class="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3">
          <summary class="cursor-pointer list-none text-sm font-medium text-slate-800">
            Añadir más detalles para afinar el presupuesto
          </summary>

          <div class="mt-4 flex flex-col gap-[12px]">
            <template v-for="field in optionalProductFields" :key="field.name">
              <FormField
                v-slot="{ componentField, value, handleChange }"
                :name="field.name"
              >
                <FormItem class="flex flex-col gap-[4px]">
                  <FormLabel :class="fieldLabelCls">{{ field.label }}</FormLabel>

                  <FormControl>
                    <Select
                      v-if="field.kind === 'select'"
                      :model-value="String(value ?? '')"
                      @update:model-value="handleChange"
                    >
                      <SelectTrigger
                        :class="controlBaseCls"
                        :data-field-name="field.name"
                      >
                        <SelectValue
                          :placeholder="field.placeholder || 'Selecciona una opción'"
                        />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem
                          v-for="opt in field.normalizedOptions"
                          :key="opt"
                          :value="opt"
                        >
                          {{ opt }}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      v-else
                      v-bind="componentField"
                      :name="field.name"
                      :type="field.type === 'number' ? 'number' : 'text'"
                      :inputmode="field.type === 'number' ? 'numeric' : undefined"
                      :placeholder="field.placeholder || ''"
                      :class="controlBaseCls"
                      autocomplete="off"
                    />
                  </FormControl>

                  <FormMessage class="text-xs" />
                </FormItem>
              </FormField>
            </template>

            <FormField v-slot="{ componentField }" name="telefono">
              <FormItem class="flex flex-col gap-[4px]">
                <FormLabel :class="fieldLabelCls">Teléfono</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    name="telefono"
                    type="tel"
                    :class="controlBaseCls"
                    autocomplete="tel"
                  />
                </FormControl>
                <FormMessage class="text-xs" />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="empresa">
              <FormItem class="flex flex-col gap-[4px]">
                <FormLabel :class="fieldLabelCls">Empresa</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    name="empresa"
                    type="text"
                    :class="controlBaseCls"
                    autocomplete="organization"
                  />
                </FormControl>
                <FormMessage class="text-xs" />
              </FormItem>
            </FormField>

            <div class="flex flex-col gap-[8px] pt-[4px]">
              <div class="text-[16px] leading-[22.4px] font-normal text-[#1E1E1E]">
                Adjuntar archivo (opcional)
              </div>

              <div class="flex flex-row items-center gap-[16px]">
                <input
                  ref="fileInputRef"
                  type="file"
                  class="hidden"
                  @change="onPickFile"
                  accept=".pdf,.jpg,.jpeg,.png,.ai,.zip"
                />

                <button
                  type="button"
                  @click="triggerFileSelect"
                  class="inline-flex h-[28px] items-center justify-center rounded-[5px] border border-[#3F3F3F] bg-white px-[10px]"
                >
                  <span class="text-[14px] leading-[19.6px] font-normal text-black">
                    Seleccionar archivo
                  </span>
                </button>

                <span
                  class="truncate text-[14px] leading-[19.6px] font-normal text-[#A2A2A2]"
                >
                  {{ fileName }}
                </span>
              </div>
            </div>
          </div>
        </details>

        <FormField v-slot="{ value, handleChange }" name="privacy">
          <FormItem class="pt-[8px]">
            <div class="flex items-center gap-2">
              <FormControl>
                <input
                  id="privacy"
                  name="privacy"
                  type="checkbox"
                  :checked="value === true"
                  @change="handleChange(($event.target as HTMLInputElement).checked)"
                />
              </FormControl>

              <FormLabel for="privacy">
                He leído y acepto la política de privacidad.
              </FormLabel>
            </div>

            <FormMessage class="mt-1 text-xs" />
          </FormItem>
        </FormField>
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

        <Button
          type="submit"
          class="h-[42px] w-full rounded-[8px] bg-[#0076B3] text-[16px] font-normal leading-[22.4px] text-white hover:bg-[#005a8d]"
          :disabled="isLoading"
          :aria-busy="isLoading ? 'true' : 'false'"
        >
          <span v-if="isLoading">Enviando…</span>
          <span v-else>Solicitar presupuesto</span>
        </Button>
      </div>
    </form>
  </section>
</template>
