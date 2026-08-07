<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "#imports";
import { useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { AlertCircle } from "lucide-vue-next";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppButton from "@/components/shared/button/AppButton.vue";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import RequestSuccessState from "@/components/marketing/quote/RequestSuccessState.vue";
import { usePriceRequests } from "@/composables/usePriceRequests";
import { useTracking } from "@/composables/useTracking";
import type { TrackingContext, TrackingEventName } from "~/types/tracking";
import {
  getNamedValue,
  normalizeProductExtraField,
  type NormalizedProductExtraField,
  type ProductExtraField,
} from "~/utils/productExtraFields";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}


const props = withDefaults(
  defineProps<{
    categorySlug: string;
    producto: string;
    extraFields?: ProductExtraField[];
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
const submittedEmail = ref("");
const submittedReference = ref<string | null>(null);
const localSubmitError = ref<string | null>(null);

const inputClass = "rd-form-control";
const textareaClass = "rd-form-textarea";
const labelClass = "rd-form-label";
const errorClass = "rd-form-control--error";

const fileName = computed(() => file.value?.name || "Ningún archivo seleccionado");

function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement;
  file.value = input.files?.[0] || null;
}

function normalizeUtm(q: Record<string, unknown>) {
  const out: Record<string, string> = {};

  for (const [k, v] of Object.entries(q || {})) {
    if (!k.toLowerCase().startsWith("utm_")) continue;
    out[k] = Array.isArray(v) ? String(v[0] ?? "") : String(v ?? "");
  }

  return Object.keys(out).length ? out : null;
}

const utm = computed(() => normalizeUtm(route.query));

const sourceUrl = computed(() => {
  const url = process.client ? location.href : route.fullPath || "/";
  return String(url).slice(0, 300);
});

const normalizedExtraFields = computed<NormalizedProductExtraField[]>(() =>
  (props.extraFields || [])
    .map(normalizeProductExtraField)
    .filter((field): field is NormalizedProductExtraField => field !== null)
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

function schemaForField(field: NormalizedProductExtraField) {
  if (field.kind === "fixed") {
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
        .string({
          required_error: "El teléfono es obligatorio",
        })
        .min(1, "El teléfono es obligatorio")
        .min(9, "Introduce un teléfono válido")
        .max(30, "El teléfono es demasiado largo")
        .regex(/^[\d\s+\-()]*$/, "Formato no válido")
    ),
    codigoPostal: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .max(20, "El código postal es demasiado largo")
        .regex(/^[A-Za-z0-9\s-]*$/, "Formato no válido")
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
  codigoPostal: "",
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

const tracking = useTracking();


function getTrackingContext(slug?: string | null): TrackingContext {
  return {
    pageType: "product",
    pageLanguage: "es",
    contentGroup: "producto",
    serviceName: props.producto,
    campaignName: undefined,
    campaignId: undefined,
    productSlug: slug || props.productData?.slug || undefined,
    categorySlug: props.categorySlug,
    formId: "product_lead_form",
    formName: "price_request",
  };
}


function getLeadTrackingPayload(slug: string) {
  const context = getTrackingContext(slug);

  return {
    ...tracking.getTrackingPayloadForLead(context),
    routeUtm: utm.value,
    sourceUrl: sourceUrl.value,
  };
}

function pushLeadEvent(params: {
  slug?: string | null;
  itemId?: string | number | null;
  requestKey?: string | null;
  quantity?: string | number | null;
}) {
  const requestKey =
    params.requestKey ||
    (params.itemId ? String(params.itemId) : null);

  tracking.pushEvent(
    "generate_lead" as TrackingEventName,
    {
      lead_type: "quote_request",
      request_key: requestKey,
      lead_id: requestKey,
      transaction_id: params.itemId ? String(params.itemId) : undefined,
      product_name: props.producto,
      quantity: params.quantity ?? null,
      page_path: import.meta.client ? window.location.pathname : route.path,
    },
    getTrackingContext(params.slug),
  );
}

function handleResetSuccessState() {
  success.value = false;
  submittedEmail.value = "";
  submittedReference.value = null;
  file.value = null;

  resetForm({
    values: initialValues.value,
  });
}

const fieldLabels = computed<Record<string, string>>(() => {
  const base: Record<string, string> = {
    cantidad: "Cantidad",
    nombre: "Nombre",
    email: "Email",
    telefono: "Teléfono",
    codigoPostal: "Código postal",
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
  if (localSubmitError.value) return localSubmitError.value;

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
    localSubmitError.value = null;

    if (values.website?.trim()) {
      success.value = true;
      return;
    }

    const slug =
      props.productData?.slug ||
      (Array.isArray(route.params.slug)
        ? route.params.slug.at(-1)
        : String(route.params.slug || ""));

    const postalCode = values.codigoPostal?.trim() || null;

    const extras: Record<string, unknown> = {
      cantidad: values.cantidad,
    };

    normalizedExtraFields.value.forEach((field) => {
      extras[field.name] = getNamedValue(values, field.name);
    });

    if (file.value) {
      extras.fileName = file.value.name;
    }

    try {
      const response = await sendPriceRequest(
        {
          name: values.nombre.trim(),
          email: values.email.trim(),
          phone: values.telefono?.trim(),
          postalCode,
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
          tracking: getLeadTrackingPayload(slug || ""),
          initialStatus: "Nova",
        },
        { file: file.value, fileKind: "design" }
      );

      const result = response as {
        ok?: boolean;
        duplicated?: boolean;
        itemId?: string | number | null;
        requestKey?: string | null;
        reference?: string | null;
        requestId?: string | null;
        id?: string | number | null;
      } | null;

      if (error.value) {
        throw new Error(
          typeof error.value === "string"
            ? error.value
            : "No hemos podido enviar la solicitud."
        );
      }

      if (!result?.ok) {
        throw new Error(
          "No hemos podido confirmar el envío de la solicitud. Inténtalo de nuevo en unos minutos."
        );
      }

      submittedEmail.value = values.email.trim();
      submittedReference.value =
        result.reference ||
        result.requestId ||
        (result.id ? String(result.id) : null) ||
        (result.itemId ? String(result.itemId) : null) ||
        result.requestKey ||
        null;

      if (!result.duplicated) {
        pushLeadEvent({
          slug,
          itemId: result.itemId,
          requestKey: result.requestKey,
          quantity: values.cantidad,
        });
      }

      success.value = true;
      emit("success");
    } catch (err) {
      console.error("[ProductLeadForm] submit error", err);

      const errorCandidates = err && typeof err === "object"
        ? Object.values(err).filter((value): value is string => typeof value === "string")
        : [];

      localSubmitError.value =
        (err instanceof Error ? err.message : errorCandidates[0]) ||
        "No hemos podido enviar la solicitud. Inténtalo de nuevo en unos minutos.";
    }
  },
  ({ errors }) => {
    focusFirstInvalidField(errors as Record<string, string>);
  }
);
</script>
<template>
  <div class="rd-form-frame">
    <RequestSuccessState v-if="success" :product-name="producto" primary-to="/productos" class="h-full w-full flex-1"
      @reset="handleResetSuccessState" />

    <form v-else @submit.prevent="onSubmit" novalidate class="rd-form-shell rd-form-shell--sticky">
      <div class="rd-form-header">
        <p class="rd-form-eyebrow">Solicitud de presupuesto</p>

        <h3 class="rd-form-title">
          Configura tu solicitud
        </h3>

        <p class="rd-form-description">
          Indica las características y te responderemos con la opción ideal.
        </p>
      </div>

      <Alert v-if="submissionErrorMessage" variant="destructive" class="rd-form-alert">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>No hemos podido enviar la solicitud</AlertTitle>
        <AlertDescription>
          {{ submissionErrorMessage }}
        </AlertDescription>
      </Alert>

      <Alert v-else-if="validationSummary.length" variant="destructive" class="rd-form-alert">
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

      <div class="rd-form-body">
        <div class="rd-form-stack">
          <section class="rd-form-section">
            <FormField name="cantidad" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">
                  Cantidad <span class="rd-form-required">*</span>
                </FormLabel>

                <FormControl>
                  <Input id="cantidad" v-bind="componentField" type="number" min="1"
                    :class="[inputClass, errorMessage && errorClass]" />
                </FormControl>

                <FormMessage />
              </FormItem>
            </FormField>

            <template v-for="field in normalizedExtraFields" :key="field.name">
              <FormField :name="field.name" v-slot="{ componentField, value, handleChange, errorMessage }">
                <FormItem>
                  <FormLabel :class="labelClass">
                    {{ field.label }}

                    <span v-if="field.kind === 'fixed'" class="rd-form-fixed-note">
                      (Incluido)
                    </span>

                    <span v-else-if="field.required" class="rd-form-required">
                      *
                    </span>

                    <span v-else class="rd-form-inline-note">
                      (Opcional)
                    </span>
                  </FormLabel>

                  <div v-if="field.kind === 'fixed'" class="rd-form-fixed-value">
                    <span>{{ String(value ?? field.initialValue) }}</span>
                    <span class="rd-form-readonly-badge">Fijo</span>
                  </div>

                  <FormControl v-else>
                    <Select v-if="field.kind === 'select'" :model-value="String(value ?? '')"
                      @update:model-value="handleChange">
                      <SelectTrigger :id="field.name" :data-field-name="field.name"
                        :class="[inputClass, errorMessage && errorClass]">
                        <SelectValue :placeholder="field.placeholder || 'Selecciona...'" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem v-for="opt in field.normalizedOptions" :key="opt" :value="opt">
                          {{ opt }}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Textarea v-else-if="field.type === 'textarea'" :id="field.name" v-bind="componentField"
                      :placeholder="field.placeholder || 'Escribe aquí...'"
                      :class="[textareaClass, errorMessage && errorClass]" />

                    <Input v-else :id="field.name" v-bind="componentField"
                      :type="field.type === 'number' ? 'number' : 'text'" :placeholder="field.placeholder || ''"
                      :class="[inputClass, errorMessage && errorClass]" />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              </FormField>
            </template>
          </section>

          <section class="rd-form-section-bordered">
            <div class="mb-1">
              <h4 class="rd-form-section-title">
                Datos de contacto
              </h4>
            </div>

            <FormField name="nombre" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">
                  Nombre <span class="rd-form-required">*</span>
                </FormLabel>

                <FormControl>
                  <Input id="nombre" v-bind="componentField" placeholder="Tu nombre"
                    :class="[inputClass, errorMessage && errorClass]" />
                </FormControl>

                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="email" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">
                  Email <span class="rd-form-required">*</span>
                </FormLabel>

                <FormControl>
                  <Input id="email" v-bind="componentField" type="email" placeholder="tu@email.com"
                    :class="[inputClass, errorMessage && errorClass]" />
                </FormControl>

                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="telefono" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">
                  Teléfono <span class="rd-form-required">*</span>
                </FormLabel>

                <FormControl>
                  <Input id="telefono" v-bind="componentField" type="tel" required autocomplete="tel"
                    placeholder="+34 600 000 000" :class="[inputClass, errorMessage && errorClass]" />
                </FormControl>

                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="codigoPostal" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">
                  Código postal
                </FormLabel>

                <FormControl>
                  <Input id="codigoPostal" v-bind="componentField" type="text" inputmode="text"
                    autocomplete="postal-code" placeholder="08001" :class="[inputClass, errorMessage && errorClass]" />
                </FormControl>

                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="empresa" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">
                  Empresa
                </FormLabel>

                <FormControl>
                  <Input id="empresa" v-bind="componentField" placeholder="Opcional"
                    :class="[inputClass, errorMessage && errorClass]" />
                </FormControl>

                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="comentario" v-slot="{ componentField, errorMessage }">
              <FormItem>
                <FormLabel :class="labelClass">
                  Comentarios
                </FormLabel>

                <FormControl>
                  <Textarea id="comentario" v-bind="componentField" placeholder="Medidas, acabados, plazos..."
                    :class="[textareaClass, errorMessage && errorClass]" />
                </FormControl>

                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="website" v-slot="{ componentField }">
              <input v-bind="componentField" class="absolute -z-10 opacity-0" tabindex="-1" autocomplete="off" />
            </FormField>
          </section>
        </div>
      </div>

      <div class="rd-form-footer">
        <div class="space-y-4">
          <div>
            <label class="rd-form-upload">
              <span class="rd-form-upload-button">
                Adjuntar archivo
              </span>

              <span class="rd-form-upload-text">
                {{
                  fileName !== "Ningún archivo seleccionado"
                    ? fileName
                    : "Opcional (PDF, JPG, AI...)"
                }}
              </span>

              <input type="file" class="sr-only" accept=".pdf,.jpg,.jpeg,.png,.ai,.zip" @change="onPickFile" />
            </label>
          </div>

          <FormField name="privacy" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <div :class="[
                'rd-form-check-panel',
                errorMessage && 'rd-form-check-panel--error',
              ]">
                <input id="privacy" name="privacy" type="checkbox" class="rd-form-checkbox"
                  :checked="componentField.modelValue === true" @change="
                    (e) =>
                      componentField.onChange(
                        (e.target as HTMLInputElement).checked
                      )
                  " />

                <div class="min-w-0 flex-1">
                  <label for="privacy" class="rd-form-privacy-text">
                    Acepto la
                    <NuxtLink to="/politica-privacidad" target="_blank" class="rd-form-link">
                      política de privacidad
                    </NuxtLink>
                    y consiento el tratamiento de mis datos.
                  </label>
                </div>
              </div>

              <FormMessage class="px-1" />
            </FormItem>
          </FormField>

          <AppButton type="submit" :disabled="isLoading" :loading="isLoading" size="lg" block>
            {{ isLoading ? "Procesando solicitud..." : "Solicitar presupuesto" }}
          </AppButton>
        </div>
      </div>
    </form>
  </div>
</template>
