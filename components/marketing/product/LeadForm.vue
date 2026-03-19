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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  "min-h-[120px] resize-y rounded-xl border-border/80 bg-background shadow-sm transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15";
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

  const selector = [
    `[name="${CSS.escape(first)}"]`,
    `[data-field-name="${CSS.escape(first)}"]`,
    `#${CSS.escape(first)}`,
  ].join(",");

  (document.querySelector(selector) as HTMLElement | null)?.focus?.();
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
  <div class="mx-auto w-full">
    <div v-if="success" class="flex min-h-[280px] flex-col justify-center">
      <Alert class="border-emerald-200 bg-emerald-50 text-emerald-900">
        <CheckCircle2 class="h-4 w-4 text-emerald-600" />
        <AlertTitle>Solicitud enviada</AlertTitle>
        <AlertDescription class="space-y-4">
          <p>Gracias. Hemos recibido tu solicitud y te responderemos a la brevedad.</p>

          <Button
            type="button"
            variant="outline"
            class="border-emerald-300 text-emerald-800 hover:bg-emerald-100"
            @click="success = false"
          >
            Enviar otra solicitud
          </Button>
        </AlertDescription>
      </Alert>
    </div>

    <form v-else @submit.prevent="onSubmit" novalidate class="flex flex-col">
      <div class="space-y-2">
        <h3 class="text-xl font-semibold tracking-tight text-foreground">
          Configura tu solicitud
        </h3>

        <p class="text-sm leading-6 text-muted-foreground">
          Indica las características del producto y te responderemos con la opción más
          adecuada.
        </p>
      </div>

      <Alert v-if="submissionErrorMessage" variant="destructive" class="mt-4">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>No hemos podido enviar la solicitud</AlertTitle>
        <AlertDescription>
          {{ submissionErrorMessage }}
        </AlertDescription>
      </Alert>

      <Alert v-else-if="validationSummary.length" variant="destructive" class="mt-4">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Revisa los campos marcados</AlertTitle>
        <AlertDescription>
          <ul class="list-disc space-y-1 pl-5">
            <li v-for="item in validationSummary.slice(0, 5)" :key="item.name">
              <strong>{{ item.label }}:</strong> {{ item.message }}
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      <ScrollArea class="mt-5 pr-2 lg:max-h-[560px] xl:max-h-[620px] 2xl:max-h-[680px]">
        <div class="space-y-6 pr-3">
          <section class="space-y-5">
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
                      class="ml-1 text-xs text-primary"
                    >
                      (Incluido)
                    </span>
                    <span v-else-if="field.required" class="text-destructive">*</span>
                    <span v-else class="ml-1 text-xs text-muted-foreground"
                      >(Opcional)</span
                    >
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
                        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-primary/15 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                      >
                        Incluido
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
                      :class="[
                        textareaClass,
                        errorMessage &&
                          'border-destructive focus-visible:ring-destructive/15',
                      ]"
                    />

                    <Input
                      v-else
                      :id="field.name"
                      v-bind="componentField"
                      :type="field.type === 'number' ? 'number' : 'text'"
                      :placeholder="field.placeholder || ''"
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
            </template>
          </section>

          <section class="space-y-5 border-t border-border/70 pt-6">
            <div class="space-y-1">
              <h4 class="text-sm font-semibold uppercase tracking-[0.08em] text-primary">
                Datos de contacto
              </h4>
              <p class="text-xs leading-5 text-muted-foreground">
                Necesitamos estos datos para enviarte la propuesta.
              </p>
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
      </ScrollArea>

      <div class="mt-5 border-t border-border/70 pt-5">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-3">
            <label class="text-sm font-medium text-foreground"> Adjuntar archivo </label>
            <span class="text-xs text-muted-foreground">(Opcional)</span>
          </div>

          <label
            class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-border/80 bg-muted/20 px-3 py-3 transition hover:bg-muted/30"
          >
            <span
              class="inline-flex h-9 shrink-0 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground"
            >
              Seleccionar archivo
            </span>

            <span class="min-w-0 flex-1 truncate text-sm text-muted-foreground">
              {{ fileName }}
            </span>

            <input
              type="file"
              class="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.ai,.zip"
              @change="onPickFile"
            />
          </label>

          <p class="text-xs text-muted-foreground">
            Formatos admitidos: PDF, JPG, PNG, AI y ZIP.
          </p>
        </div>

        <FormField name="privacy" v-slot="{ componentField, errorMessage }">
          <FormItem class="mt-4">
            <div
              :class="[
                'flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors',
                errorMessage
                  ? 'border-destructive/50 bg-destructive/5'
                  : 'border-border/70 bg-muted/20',
              ]"
            >
              <input
                id="privacy-check"
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                :checked="componentField.modelValue === true"
                @change="(e) => componentField.onChange((e.target as HTMLInputElement).checked)"
              />

              <div class="min-w-0">
                <label for="privacy-check" class="text-sm leading-6 text-foreground/85">
                  He leído y acepto la
                  <NuxtLink
                    to="/politica-privacidad"
                    target="_blank"
                    class="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    política de privacidad </NuxtLink
                  >.
                </label>

                <FormMessage />
              </div>
            </div>
          </FormItem>
        </FormField>

        <Button type="submit" :disabled="isLoading" class="mt-4 h-12 w-full rounded-xl">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ isLoading ? "Enviando..." : "Solicitar presupuesto" }}
        </Button>

        <p class="mt-3 text-xs leading-5 text-muted-foreground">
          Al enviar este formulario aceptas que te contactemos para preparar tu
          presupuesto y resolver cualquier duda técnica relacionada con este producto.
        </p>
      </div>
    </form>
  </div>
</template>
