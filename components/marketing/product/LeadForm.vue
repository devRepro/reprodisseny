<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "#imports";
import { useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-vue-next";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

const route = useRoute();
const file = ref<File | null>(null);
const success = ref(false);

const inputClass =
  "h-11 rounded-xl border-border/80 bg-background shadow-sm transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15";
const readonlyInputClass =
  "h-11 rounded-xl border-border/80 bg-muted/35 pr-24 text-foreground/85 shadow-sm";
const textareaClass =
  "min-h-[96px] resize-y rounded-xl border-border/80 bg-background shadow-sm transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15";
const labelClass = "text-sm font-medium text-foreground";

const fileName = computed(() => file.value?.name || "Ningún archivo seleccionado");

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
  [
    "cantidad",
    "comentario",
    "observaciones",
    "privacy",
    "nombre",
    "email",
    "telefono",
    "empresa",
    "website",
  ].map(normalizeKey)
);

function normalizeExtraField(field: ExtraField): NormalizedExtraField | null {
  const safeName = String(field.name || "").trim();
  const safeLabel = String(field.label || field.name || "").trim();
  const safeType = (field.type || "text") as ExtraField["type"];

  if (!safeName || !safeLabel || BASE_FIELDS.has(normalizeKey(safeName))) {
    return null;
  }

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
        kind: "readonly",
        normalizedOptions,
        initialValue: normalizedOptions[0],
      };
    }

    return {
      ...field,
      name: safeName,
      label: safeLabel,
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
    .filter((f): f is NormalizedExtraField => !!f)
);

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
    return z.preprocess(
      emptyToUndefined,
      z.string({ required_error: "Requerido" }).min(1)
    );
  }

  if (field.type === "number") {
    const base = z.number({
      required_error: `El campo ${field.label} es obligatorio`,
      invalid_type_error: "Debe ser un número",
    });

    return field.required
      ? z.preprocess(normalizeNumber, base.min(0, "Mínimo 0"))
      : z.preprocess(normalizeNumber, base.optional());
  }

  const baseStr = z.string({
    required_error: `El campo ${field.label} es obligatorio`,
  });

  return field.required
    ? z.preprocess(emptyToUndefined, baseStr.min(1, "Campo obligatorio"))
    : z.preprocess(emptyToUndefined, z.string().optional());
}

const validationSchema = computed(() => {
  const shape: Record<string, z.ZodTypeAny> = {
    website: z.string().optional(),
    cantidad: z.preprocess(
      normalizeNumber,
      z.number({ required_error: "Obligatorio" }).min(1, "Mínimo 1")
    ),
    nombre: z.preprocess(
      emptyToUndefined,
      z.string({ required_error: "Obligatorio" }).min(2, "Nombre demasiado corto")
    ),
    email: z.preprocess(
      emptyToUndefined,
      z.string({ required_error: "Obligatorio" }).email("Email no válido")
    ),
    telefono: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .regex(/^[\d\s\+\-]*$/, "Formato no válido")
        .optional()
    ),
    empresa: z.preprocess(emptyToUndefined, z.string().optional()),
    comentario: z.preprocess(emptyToUndefined, z.string().max(4000).optional()),
    privacy: z.literal(true, {
      errorMap: () => ({ message: "Debes aceptar la política" }),
    }),
  };

  normalizedExtraFields.value.forEach((field) => {
    shape[field.name] = schemaForField(field);
  });

  return toTypedSchema(z.object(shape));
});

const initialValues = computed(() => ({
  website: "",
  cantidad: 1,
  nombre: "",
  email: "",
  telefono: "",
  empresa: "",
  comentario: "",
  privacy: false,
  ...Object.fromEntries(
    normalizedExtraFields.value.map((field) => [field.name, field.initialValue])
  ),
}));

const { handleSubmit, resetForm, errors, submitCount } = useForm({
  validationSchema,
  initialValues: initialValues.value,
});

watch(initialValues, (values) => resetForm({ values }), { deep: true });

const { sendPriceRequest, isLoading, error } = usePriceRequests();

const fieldLabels = computed<Record<string, string>>(() => {
  const base: Record<string, string> = {
    cantidad: "Cantidad",
    nombre: "Nombre",
    email: "Email",
    telefono: "Teléfono",
    empresa: "Empresa",
    comentario: "Comentarios",
    privacy: "Política de privacidad",
  };

  normalizedExtraFields.value.forEach((field) => {
    base[field.name] = field.label;
  });

  return base;
});

const validationSummary = computed(() => {
  if (submitCount.value < 1) return [];

  return Object.entries(errors.value || {})
    .filter(([name]) => name !== "website")
    .map(([name, message]) => ({
      name,
      label: fieldLabels.value[name] || name,
      message: String(message),
    }));
});

const submissionErrorMessage = computed(() => {
  if (!error.value) return "";
  return typeof error.value === "string"
    ? error.value
    : "No hemos podido enviar la solicitud. Inténtalo de nuevo en unos minutos.";
});

function focusFirstInvalidField(errors: Record<string, string>) {
  const first = Object.keys(errors || {})[0];
  if (!first) return;

  setTimeout(() => {
    const selector = [
      `[name="${CSS.escape(first)}"]`,
      `[data-field-name="${CSS.escape(first)}"]`,
      `#${CSS.escape(first)}`,
    ].join(",");

    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 50);
}

const onSubmit = handleSubmit(
  async (values) => {
    if (values.website?.trim()) {
      success.value = true;
      return;
    }

    const slug =
      props.productData?.slug ||
      (Array.isArray(route.params.slug)
        ? route.params.slug.at(-1)
        : String(route.params.slug || ""));

    const extras: Record<string, unknown> = {
      cantidad: values.cantidad,
    };

    normalizedExtraFields.value.forEach((field) => {
      extras[field.name] = (values as any)[field.name];
    });

    if (file.value) {
      extras.fileName = file.value.name;
    }

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
      resetForm({ values: initialValues.value });
      file.value = null;
    }
  },
  ({ errors }) => {
    focusFirstInvalidField(errors as Record<string, string>);
  }
);
</script>

<template>
  <div class="flex h-full min-h-0 w-full min-w-0 flex-col">
    <div v-if="success" class="flex min-h-[280px] flex-col justify-center py-8">
      <Alert class="border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm">
        <CheckCircle2 class="h-5 w-5 text-emerald-600" />
        <AlertTitle class="text-base font-semibold">Solicitud enviada</AlertTitle>
        <AlertDescription class="mt-2 space-y-4">
          <p class="text-sm">
            Gracias. Hemos recibido tu solicitud y te responderemos a la brevedad.
          </p>
          <Button
            type="button"
            variant="outline"
            class="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-100 sm:w-auto"
            @click="success = false"
          >
            Enviar otra solicitud
          </Button>
        </AlertDescription>
      </Alert>
    </div>

    <form
      v-else
      @submit.prevent="onSubmit"
      novalidate
      class="relative flex min-h-0 flex-1 flex-col"
    >
      <div class="mb-5 shrink-0 space-y-1">
        <h3
          class="text-[1.05rem] font-semibold tracking-tight text-foreground md:text-xl"
        >
          Configura tu solicitud
        </h3>
        <p class="text-sm leading-relaxed text-muted-foreground">
          Indica las características y te responderemos con la opción ideal.
        </p>
      </div>

      <Alert
        v-if="submissionErrorMessage"
        variant="destructive"
        class="mb-4 shrink-0 shadow-sm"
      >
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>No hemos podido enviar la solicitud</AlertTitle>
        <AlertDescription>{{ submissionErrorMessage }}</AlertDescription>
      </Alert>

      <Alert
        v-else-if="validationSummary.length"
        variant="destructive"
        class="mb-4 shrink-0 shadow-sm"
      >
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Revisa los campos marcados</AlertTitle>
        <AlertDescription>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li v-for="item in validationSummary.slice(0, 5)" :key="item.name">
              <strong>{{ item.label }}:</strong> {{ item.message }}
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      <div class="min-h-0 flex-1 xl:overflow-y-auto xl:pr-2">
        <div class="space-y-4 pb-4 md:space-y-5">
          <section class="space-y-4">
            <FormField name="cantidad" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">
                  Cantidad <span class="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="cantidad"
                    v-bind="componentField"
                    type="number"
                    min="1"
                    :class="[
                      inputClass,
                      errorMessage &&
                        'border-destructive focus-visible:ring-destructive/15',
                    ]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <template v-for="field in normalizedExtraFields" :key="field.name">
              <FormField
                :name="field.name"
                v-slot="{ componentField, value, handleChange, errorMessage }"
              >
                <FormItem>
                  <FormLabel :class="labelClass">
                    {{ field.label }}

                    <span
                      v-if="field.kind === 'readonly'"
                      class="ml-1 text-[11px] font-bold uppercase tracking-wider text-primary"
                    >
                      (Incluido)
                    </span>

                    <span v-else-if="field.required" class="text-destructive">*</span>

                    <span v-else class="ml-1 text-xs font-normal text-muted-foreground">
                      (Opcional)
                    </span>
                  </FormLabel>

                  <FormControl>
                    <div v-if="field.kind === 'readonly'" class="relative">
                      <Input
                        :id="field.name"
                        v-bind="componentField"
                        :value="String(value ?? field.initialValue)"
                        readonly
                        aria-readonly="true"
                        :class="readonlyInputClass"
                      />
                      <span
                        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                      >
                        Fijo
                      </span>
                    </div>

                    <Select
                      v-else-if="field.kind === 'select'"
                      :model-value="String(value ?? '')"
                      @update:model-value="handleChange"
                    >
                      <SelectTrigger
                        :id="field.name"
                        :data-field-name="field.name"
                        :class="[inputClass, errorMessage && 'border-destructive']"
                      >
                        <SelectValue
                          :placeholder="field.placeholder || 'Selecciona...'"
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
                      :id="field.name"
                      v-bind="componentField"
                      :placeholder="field.placeholder || 'Escribe aquí...'"
                      :class="[textareaClass, errorMessage && 'border-destructive']"
                    />

                    <Input
                      v-else
                      :id="field.name"
                      v-bind="componentField"
                      :type="field.type === 'number' ? 'number' : 'text'"
                      :placeholder="field.placeholder || ''"
                      :class="[inputClass, errorMessage && 'border-destructive']"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              </FormField>
            </template>
          </section>

          <section class="space-y-4 border-t border-border/60 pt-5">
            <div class="mb-1">
              <h4
                class="text-sm font-bold uppercase tracking-[0.08em] text-foreground/80"
              >
                Datos de contacto
              </h4>
            </div>

            <FormField name="nombre" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">
                  Nombre <span class="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="nombre"
                    v-bind="componentField"
                    placeholder="Tu nombre"
                    :class="[inputClass, errorMessage && 'border-destructive']"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="email" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">
                  Email <span class="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    v-bind="componentField"
                    type="email"
                    placeholder="tu@email.com"
                    :class="[inputClass, errorMessage && 'border-destructive']"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="telefono" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">Teléfono</FormLabel>
                <FormControl>
                  <Input
                    id="telefono"
                    v-bind="componentField"
                    type="tel"
                    placeholder="+34 600 000 000"
                    :class="[inputClass, errorMessage && 'border-destructive']"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="empresa" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">Empresa</FormLabel>
                <FormControl>
                  <Input
                    id="empresa"
                    v-bind="componentField"
                    placeholder="Opcional"
                    :class="[inputClass, errorMessage && 'border-destructive']"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="comentario" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">Comentarios</FormLabel>
                <FormControl>
                  <Textarea
                    id="comentario"
                    v-bind="componentField"
                    placeholder="Medidas, acabados, plazos..."
                    :class="[textareaClass, errorMessage && 'border-destructive']"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="website" v-slot="{ componentField }">
              <input
                v-bind="componentField"
                class="absolute -z-10 opacity-0"
                tabindex="-1"
                autocomplete="off"
              />
            </FormField>
          </section>
        </div>
      </div>

      <div class="mt-4 shrink-0 border-t border-border/40 pt-4 lg:bg-card">
        <div class="space-y-4">
          <div>
            <label
              class="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-border/80 bg-muted/20 px-3 py-2.5 transition hover:border-primary/40 hover:bg-muted/40 focus-within:ring-2 focus-within:ring-primary/20"
            >
              <span
                class="inline-flex h-8 shrink-0 items-center rounded-md border border-border/60 bg-background px-3 text-xs font-semibold text-foreground transition-colors group-hover:bg-background/80"
              >
                Adjuntar archivo
              </span>

              <span
                class="min-w-0 flex-1 truncate text-right text-xs text-muted-foreground group-hover:text-foreground"
              >
                {{
                  fileName !== "Ningún archivo seleccionado"
                    ? fileName
                    : "Opcional (PDF, JPG, AI...)"
                }}
              </span>

              <input
                type="file"
                class="sr-only"
                accept=".pdf,.jpg,.jpeg,.png,.ai,.zip"
                @change="onPickFile"
              />
            </label>
          </div>

          <FormField name="privacy" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <div
                :class="[
                  'flex items-start gap-3 rounded-xl p-3 transition-colors',
                  errorMessage
                    ? 'bg-destructive/5 ring-1 ring-destructive/30'
                    : 'bg-muted/30',
                ]"
              >
                <input
                  id="privacy"
                  name="privacy"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary/20"
                  :checked="componentField.modelValue === true"
                  @change="
                    (e) =>
                      componentField.onChange(
                        (e.target as HTMLInputElement).checked
                      )
                  "
                />

                <div class="min-w-0 flex-1">
                  <label
                    for="privacy"
                    class="block cursor-pointer text-xs leading-tight text-foreground/80"
                  >
                    Acepto la
                    <NuxtLink
                      to="/politica-privacidad"
                      target="_blank"
                      class="font-semibold text-primary hover:underline"
                    >
                      política de privacidad
                    </NuxtLink>
                    y consiento el tratamiento de mis datos.
                  </label>
                </div>
              </div>

              <FormMessage class="px-1" />
            </FormItem>
          </FormField>

          <Button
            type="submit"
            :disabled="isLoading"
            class="h-12 w-full rounded-xl text-base font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            <Loader2 v-if="isLoading" class="mr-2 h-5 w-5 animate-spin" />
            {{ isLoading ? "Procesando solicitud..." : "Solicitar presupuesto" }}
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>
