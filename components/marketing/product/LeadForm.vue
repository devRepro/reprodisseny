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
  type?: "text" | "number" | "select" | "textarea";
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
    productData?: {
      slug?: string;
      sku?: string | null;
      path?: string;
      title?: string;
    } | null;
  }>(),
  { extraFields: () => [], productData: null }
);

const emit = defineEmits<{
  success: [];
}>();

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

function normalizeKey(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

const BASE_FIELDS = new Set(
  [
    "cantidad",
    "comentario",
    "privacy",
    "nombre",
    "email",
    "telefono",
    "teléfono",
    "empresa",
  ].map(normalizeKey)
);

function normalizeExtraField(field: ExtraField): NormalizedExtraField | null {
  const safeName = String(field.name || "").trim();
  const safeLabel = String(field.label || field.name || "").trim();
  const safeType = (field.type || "text") as ExtraField["type"];

  if (!safeName || !safeLabel) return null;
  if (BASE_FIELDS.has(normalizeKey(safeName))) return null;

  const normalizedOptions = (field.options || [])
    .map((opt) => String(opt).trim())
    .filter(Boolean);

  if (safeType === "select") {
    if (normalizedOptions.length === 0) return null;

    if (normalizedOptions.length === 1) {
      return {
        ...field,
        name: safeName,
        label: safeLabel,
        type: safeType,
        kind: "fixed",
        normalizedOptions,
        initialValue: normalizedOptions[0],
      };
    }

    return {
      ...field,
      name: safeName,
      label: safeLabel,
      type: safeType,
      kind: "select",
      normalizedOptions,
      initialValue: "",
    };
  }

  return {
    ...field,
    name: safeName,
    label: safeLabel,
    type: safeType,
    kind: "input",
    normalizedOptions,
    initialValue: "",
  };
}

const normalizedExtraFields = computed<NormalizedExtraField[]>(() =>
  (props.extraFields || [])
    .map(normalizeExtraField)
    .filter((field): field is NormalizedExtraField => Boolean(field))
);

const fixedProductFields = computed(() =>
  normalizedExtraFields.value.filter((field) => field.kind === "fixed")
);

const configurableRequiredFields = computed(() =>
  normalizedExtraFields.value.filter((field) => field.kind !== "fixed" && field.required)
);

const configurableOptionalFields = computed(() =>
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
              invalid_type_error: `El campo ${field.label} debe ser un número`,
            })
            .min(0, `El valor mínimo para ${field.label} es 0`)
        )
      : z.preprocess(
          normalizeNumber,
          z
            .number({
              invalid_type_error: `El campo ${field.label} debe ser un número`,
            })
            .optional()
        );
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
          invalid_type_error: "La cantidad debe ser un número",
        })
        .min(1, "La cantidad mínima es 1")
    ),
    comentario: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .max(4000, "La descripción no puede superar los 4000 caracteres")
        .optional()
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
  fileRef.value = null;
  if (fileInputRef.value) fileInputRef.value.value = "";
});

const { sendPriceRequest, isLoading, error } = usePriceRequests();

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
    const slug =
      props.productData?.slug ||
      (Array.isArray(route.params.slug)
        ? route.params.slug.at(-1)
        : String(route.params.slug || ""));

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
      slug: slug || null,
      sku: props.productData?.sku ?? null,
      url: props.productData?.path || route.fullPath,
    };

    await sendPriceRequest(
      {
        website: null,
        name: values.nombre,
        email: values.email,
        phone: values.telefono || null,
        company: values.empresa || null,
        message:
          typeof values.comentario === "string" && values.comentario.trim()
            ? values.comentario.trim()
            : null,
        categorySlug: props.categorySlug,
        product: productPayload,
        extras,
        consent: values.privacy === true,
        sourceUrl: process.client ? window.location.href : route.fullPath,
        utm: route.query as Record<string, any>,
        initialStatus: "Nova",
      },
      {
        file: fileRef.value ?? null,
        fileKind: "design",
      }
    );

    emit("success");
  },
  ({ errors }) => {
    focusFirstInvalidField(errors as Record<string, string>);
  }
);

const fieldLabelCls = "product-form-label";
const controlBaseCls = "product-form-control";
const textareaCls = "product-form-textarea";
</script>

<template>
  <section class="w-full">
    <form class="flex w-full flex-col gap-3" @submit.prevent="onSubmit" novalidate>
      <div class="flex flex-col gap-3">
        <FormField v-slot="{ componentField }" name="cantidad">
          <FormItem class="flex flex-col gap-2">
            <FormLabel :class="fieldLabelCls">
              Cantidad <span class="text-destructive">*</span>
            </FormLabel>
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

        <div v-if="fixedProductFields.length" class="product-form-defaults">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="product-form-defaults-kicker">Incluido por defecto</p>
              <h3 class="mt-1 product-form-defaults-title">
                Configuración incluida en este producto
              </h3>
              <p class="mt-1 product-form-defaults-copy">
                Estas opciones ya están contempladas en el presupuesto base.
              </p>
            </div>

            <span class="product-form-default-chip">Incluido</span>
          </div>

          <ul class="mt-4 flex flex-wrap gap-2">
            <li
              v-for="field in fixedProductFields"
              :key="field.name"
              class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/15 bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm"
            >
              <span class="font-semibold text-primary">{{ field.label }}:</span>
              <span class="truncate">{{ field.initialValue }}</span>
            </li>
          </ul>
        </div>

        <div v-if="configurableRequiredFields.length" class="space-y-4">
          <div class="space-y-1">
            <p class="product-form-defaults-kicker">Elige tus opciones</p>
            <p class="product-form-section-copy">
              Personaliza los detalles variables para ajustar el presupuesto.
            </p>
          </div>

          <template v-for="field in configurableRequiredFields" :key="field.name">
            <FormField
              v-slot="{ componentField, value, handleChange }"
              :name="field.name"
            >
              <FormItem class="flex flex-col gap-2">
                <FormLabel :class="fieldLabelCls">
                  {{ field.label }}
                  <span v-if="field.required" class="text-destructive">*</span>
                </FormLabel>

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

                  <Textarea
                    v-else-if="field.type === 'textarea'"
                    v-bind="componentField"
                    :name="field.name"
                    :class="textareaCls"
                    :placeholder="field.placeholder || ''"
                    rows="4"
                  />

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
        </div>

        <FormField v-slot="{ componentField }" name="nombre">
          <FormItem class="flex flex-col gap-2">
            <FormLabel :class="fieldLabelCls">
              Nombre <span class="text-destructive">*</span>
            </FormLabel>
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
          <FormItem class="flex flex-col gap-2">
            <FormLabel :class="fieldLabelCls">
              Email <span class="text-destructive">*</span>
            </FormLabel>
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
          <FormItem class="flex flex-col gap-2">
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

        <details class="rounded-2xl border border-border bg-muted/30 px-4 py-3">
          <summary class="cursor-pointer list-none text-sm font-medium text-foreground">
            Añadir más detalles para afinar el presupuesto
          </summary>

          <div class="mt-4 flex flex-col gap-3">
            <template v-for="field in configurableOptionalFields" :key="field.name">
              <FormField
                v-slot="{ componentField, value, handleChange }"
                :name="field.name"
              >
                <FormItem class="flex flex-col gap-2">
                  <FormLabel :class="fieldLabelCls">
                    {{ field.label }}
                  </FormLabel>

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

                    <Textarea
                      v-else-if="field.type === 'textarea'"
                      v-bind="componentField"
                      :name="field.name"
                      :class="textareaCls"
                      :placeholder="field.placeholder || ''"
                      rows="4"
                    />

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
              <FormItem class="flex flex-col gap-2">
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
              <FormItem class="flex flex-col gap-2">
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

            <div class="flex flex-col gap-2 pt-1">
              <div class="product-form-label">Adjuntar archivo (opcional)</div>

              <div class="flex items-center gap-4">
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
                  class="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Seleccionar archivo
                </button>

                <span class="truncate text-sm text-muted-foreground">
                  {{ fileName }}
                </span>
              </div>
            </div>
          </div>
        </details>

        <FormField v-slot="{ value, handleChange }" name="privacy">
          <FormItem class="pt-2">
            <div class="flex items-start gap-3">
              <FormControl>
                <input
                  id="privacy"
                  name="privacy"
                  type="checkbox"
                  class="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  :checked="value === true"
                  @change="handleChange(($event.target as HTMLInputElement).checked)"
                />
              </FormControl>

              <FormLabel
                for="privacy"
                class="mb-0 text-sm font-normal leading-6 text-foreground"
              >
                He leído y acepto la política de privacidad.
              </FormLabel>
            </div>

            <FormMessage class="mt-1 text-xs" />
          </FormItem>
        </FormField>

        <div
          v-if="error"
          class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {{ error }}
        </div>

        <Button
          type="submit"
          class="product-form-submit"
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
