<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "#imports";
import { useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { Loader2, CheckCircle2 } from "lucide-vue-next";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { usePriceRequests } from "@/composables/usePriceRequests";

// --- Tipos e Interfaces ---

type ExtraField = {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

type NormalizedExtraField = ExtraField & {
  kind: "input" | "select" | "readonly";
  normalizedOptions: string[];
  initialValue: string | number;
};

const props = withDefaults(
  defineProps<{
    categorySlug: string;
    producto: string;
    extraFields?: ExtraField[];
    productData?: {
      slug?: string;
      sku?: string | null;
      path?: string;
      title?: string;
    } | null;
  }>(),
  {
    extraFields: () => [],
    productData: null,
  }
);

const emit = defineEmits<{
  success: [];
}>();

// --- Estado y Referencias ---

const route = useRoute();
const file = ref<File | null>(null);
const success = ref(false);

const inputClass =
  "h-[43px] rounded-[10px] border-gray-300 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20 shadow-sm transition-all duration-200";
const textareaClass =
  "min-h-[128px] resize-y rounded-[10px] border-gray-300 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20 shadow-sm transition-all duration-200";

const fileName = computed(() => file.value?.name || "Ningún archivo seleccionado");

// --- Utilidades de Normalización ---

function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement;
  file.value = input.files?.[0] || null;
}

function normalizeUtm(q: Record<string, any>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(q || {})) {
    if (!k.toLowerCase().startsWith("utm_")) continue;
    out[k] = Array.isArray(v) ? String(v[0] ?? "") : String(v ?? "");
  }
  return Object.keys(out).length ? out : null;
}

const utm = computed(() => normalizeUtm(route.query as any));

const sourceUrl = computed(() => {
  const url = process.client ? location.href : route.fullPath || "/";
  return String(url).slice(0, 300);
});

function normalizeKey(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

const BASE_FIELDS = new Set(
  ["cantidad", "comentario", "observaciones", "privacy", "nombre", "email", "telefono", "empresa", "website"].map(normalizeKey)
);

function normalizeExtraField(field: ExtraField): NormalizedExtraField | null {
  const safeName = String(field.name || "").trim();
  const safeLabel = String(field.label || field.name || "").trim();
  const safeType = (field.type || "text") as ExtraField["type"];

  if (!safeName || !safeLabel || BASE_FIELDS.has(normalizeKey(safeName))) return null;

  const normalizedOptions = (field.options || []).map((opt) => String(opt).trim()).filter(Boolean);

  if (safeType === "select") {
    if (normalizedOptions.length === 0) return null;
    if (normalizedOptions.length === 1) {
      return { ...field, name: safeName, label: safeLabel, kind: "readonly", normalizedOptions, initialValue: normalizedOptions[0] };
    }
    return { ...field, name: safeName, label: safeLabel, kind: "select", normalizedOptions, initialValue: "" };
  }

  return { ...field, name: safeName, label: safeLabel, type: safeType, kind: "input", normalizedOptions, initialValue: "" };
}

const normalizedExtraFields = computed<NormalizedExtraField[]>(() =>
  (props.extraFields || []).map(normalizeExtraField).filter((f): f is NormalizedExtraField => !!f)
);

// --- Validación y Esquema ---

function normalizeNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}

function emptyToUndefined(value: unknown) {
  if (typeof value === "string") return value.trim() || undefined;
  return value ?? undefined;
}

function schemaForField(field: NormalizedExtraField) {
  if (field.kind === "readonly") {
    return z.preprocess(emptyToUndefined, z.string({ required_error: "Requerido" }).min(1));
  }
  if (field.type === "number") {
    const base = z.number({ 
        required_error: `El campo ${field.label} es obligatorio`,
        invalid_type_error: "Debe ser un número" 
    });
    return field.required 
        ? z.preprocess(normalizeNumber, base.min(0, "Mínimo 0"))
        : z.preprocess(normalizeNumber, base.optional());
  }
  const baseStr = z.string({ required_error: `El campo ${field.label} es obligatorio` });
  return field.required 
    ? z.preprocess(emptyToUndefined, baseStr.min(1, "Campo obligatorio"))
    : z.preprocess(emptyToUndefined, z.string().optional());
}

const validationSchema = computed(() => {
  const shape: Record<string, z.ZodTypeAny> = {
    website: z.string().optional(),
    cantidad: z.preprocess(normalizeNumber, z.number({ required_error: "Obligatorio" }).min(1, "Mínimo 1")),
    nombre: z.preprocess(emptyToUndefined, z.string({ required_error: "Obligatorio" }).min(2, "Nombre demasiado corto")),
    email: z.preprocess(emptyToUndefined, z.string({ required_error: "Obligatorio" }).email("Email no válido")),
    telefono: z.preprocess(emptyToUndefined, z.string().regex(/^[\d\s\+\-]*$/, "Formato no válido").optional()),
    empresa: z.preprocess(emptyToUndefined, z.string().optional()),
    comentario: z.preprocess(emptyToUndefined, z.string().max(4000).optional()),
    privacy: z.literal(true, { errorMap: () => ({ message: "Debes aceptar la política" }) }),
  };

  normalizedExtraFields.value.forEach(f => { shape[f.name] = schemaForField(f); });
  return toTypedSchema(z.object(shape));
});

// --- Lógica de Formulario ---

const initialValues = computed(() => ({
  website: "",
  cantidad: 1,
  nombre: "",
  email: "",
  telefono: "",
  empresa: "",
  comentario: "",
  privacy: false,
  ...Object.fromEntries(normalizedExtraFields.value.map(f => [f.name, f.initialValue]))
}));

const { handleSubmit, resetForm } = useForm({
  validationSchema,
  initialValues: initialValues.value,
});

watch(initialValues, (val) => resetForm({ values: val }), { deep: true });

const { sendPriceRequest, isLoading, error } = usePriceRequests();

function focusFirstInvalidField(errors: Record<string, string>) {
  const first = Object.keys(errors || {})[0];
  if (!first) return;
  const selector = `[name="${CSS.escape(first)}"], [data-field-name="${CSS.escape(first)}"], #${CSS.escape(first)}`;
  (document.querySelector(selector) as HTMLElement)?.focus?.();
}

const onSubmit = handleSubmit(
  async (values) => {
    if (values.website?.trim()) { success.value = true; return; }

    const slug = props.productData?.slug || (Array.isArray(route.params.slug) ? route.params.slug.at(-1) : String(route.params.slug || ""));
    const extras: Record<string, unknown> = { cantidad: values.cantidad };
    normalizedExtraFields.value.forEach(f => { extras[f.name] = (values as any)[f.name]; });
    if (file.value) extras.fileName = file.value.name;

    await sendPriceRequest(
      {
        name: values.nombre.trim(),
        email: values.email.trim(),
        phone: values.telefono?.trim() || null,
        company: values.empresa?.trim() || null,
        message: values.comentario?.trim() || "Solicitud de presupuesto",
        categorySlug: props.categorySlug,
        product: {
          name: props.producto,
          slug: slug || null,
          sku: props.productData?.sku ?? null,
          url: props.productData?.path || sourceUrl.value,
        },
        extras,
        consent: true,
        sourceUrl: sourceUrl.value,
        utm: utm.value,
        initialStatus: "Nova",
      },
      { file: file.value, fileKind: "design" }
    );

    if (!error.value) {
      success.value = true;
      emit("success");
      resetForm();
      file.value = null;
    }
  },
  ({ errors }) => focusFirstInvalidField(errors as Record<string, string>)
);
</script>

<template>
  <div class="mx-auto w-full">
    <div v-if="success" class="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 p-8 text-center animate-in fade-in slide-in-from-bottom-4">
      <CheckCircle2 class="mb-4 h-16 w-16 text-emerald-600" />
      <h3 class="mb-2 font-['Figtree'] text-2xl font-bold text-emerald-800">¡Solicitud enviada!</h3>
      <p class="font-['Figtree'] text-emerald-700">Gracias. Te responderemos a la brevedad.</p>
      <Button variant="outline" class="mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-100" @click="success = false">Enviar otra solicitud</Button>
    </div>

    <form v-else @submit.prevent="onSubmit" novalidate class="flex flex-col gap-6">
      <div v-if="error" class="rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
        ⚠️ {{ error }}
      </div>

      <div class="flex flex-col gap-5">
        <FormField name="cantidad" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel class="font-['Figtree'] text-base font-normal text-gray-900">Cantidad <span class="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input v-bind="componentField" type="number" :class="[inputClass, errorMessage && 'border-red-500 focus:ring-red-200']" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <template v-for="field in normalizedExtraFields" :key="field.name">
          <FormField :name="field.name" v-slot="{ componentField, value, handleChange, errorMessage }">
            <FormItem>
              <FormLabel class="font-['Figtree'] text-base font-normal text-gray-900">
                {{ field.label }}
                <span v-if="field.kind === 'readonly'" class="ml-1 text-sm text-gray-400">(Incluido)</span>
                <span v-else-if="field.required" class="text-red-500">*</span>
                <span v-else class="ml-1 text-sm text-gray-400">(Opcional)</span>
              </FormLabel>

              <FormControl>
                <div v-if="field.kind === 'readonly'" class="relative">
                  <Input v-bind="componentField" :value="String(value ?? field.initialValue)" readonly class="bg-slate-50 pr-24" />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#0076B3]">Incluido</span>
                </div>

                <Select v-else-if="field.kind === 'select'" :model-value="String(value ?? '')" @update:model-value="handleChange">
                  <SelectTrigger :class="[inputClass, errorMessage && 'border-red-500']" :data-field-name="field.name">
                    <SelectValue :placeholder="field.placeholder || 'Selecciona...'" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="opt in field.normalizedOptions" :key="opt" :value="opt">{{ opt }}</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea v-else-if="field.type === 'textarea'" v-bind="componentField" :class="[textareaClass, errorMessage && 'border-red-500']" />

                <Input v-else v-bind="componentField" :type="field.type === 'number' ? 'number' : 'text'" :class="[inputClass, errorMessage && 'border-red-500']" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </template>

        <FormField name="nombre" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel>Nombre <span class="text-red-500">*</span></FormLabel>
            <FormControl><Input v-bind="componentField" :class="[inputClass, errorMessage && 'border-red-500']" /></FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="email" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel>Email <span class="text-red-500">*</span></FormLabel>
            <FormControl><Input v-bind="componentField" type="email" :class="[inputClass, errorMessage && 'border-red-500']" /></FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="website" v-slot="{ componentField }">
          <input v-bind="componentField" class="absolute -z-10 opacity-0" tabindex="-1" />
        </FormField>

        <div class="grid gap-2">
          <label class="font-['Figtree'] text-base font-normal text-gray-900">Adjuntar archivo <span class="text-sm text-gray-400">(Opcional)</span></label>
          <div class="flex items-center gap-4">
            <label class="inline-flex h-[28px] cursor-pointer items-center rounded-[5px] border border-[#3F3F3F] px-[10px] text-[14px] text-black">
              Seleccionar archivo
              <input type="file" class="hidden" @change="onPickFile" accept=".pdf,.jpg,.jpeg,.png,.ai,.zip" />
            </label>
            <span class="truncate text-[14px] text-[#A2A2A2]">{{ fileName }}</span>
          </div>
        </div>

        <FormField name="privacy" v-slot="{ componentField }">
          <FormItem>
            <div class="flex items-start gap-3">
              <input id="privacy-check" type="checkbox" class="mt-1 h-5 w-5 rounded border-gray-300 text-[#0076B3]" :checked="componentField.modelValue === true" @change="(e) => componentField.onChange((e.target as HTMLInputElement).checked)" />
              <label for="privacy-check" class="text-sm text-gray-700">He leído y acepto la <a href="/politica-privacidad" target="_blank" class="text-[#0076B3] hover:underline">política de privacidad</a>.</label>
            </div>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <Button type="submit" :disabled="isLoading" class="h-12 w-full bg-[#0076B3] text-white hover:bg-[#006599]">
        <Loader2 v-if="isLoading" class="mr-2 h-5 w-5 animate-spin" />
        {{ isLoading ? "Enviando..." : "Solicitar presupuesto" }}
      </Button>
    </form>
  </div>
</template>