<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "#imports";
import { useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";

import AppButton from "@/components/shared/button/AppButton.vue";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  getPriceRequestClientValidationFields,
  usePriceRequests,
} from "@/composables/usePriceRequests";
import { useLeadFormTracking } from "@/composables/useLeadFormTracking";
import { useTracking } from "@/composables/useTracking";
import { cn } from "@/lib/utils";
import {
  priceRequestConsentSchema,
  priceRequestEmailSchema,
  priceRequestMessageSchema,
  priceRequestNameSchema,
  priceRequestPhoneSchema,
} from "~/shared/schemas/priceRequest";
import type { TrackingContext } from "~/types/tracking";

const props = withDefaults(
  defineProps<{
    submitEndpoint?: string;
    categorySlug?: string;
    productName?: string;
    productSlug?: string | null;
  }>(),
  {
    submitEndpoint: "/api/price-requests",
    categorySlug: "presupuesto",
    productName: "Presupuesto genérico",
    productSlug: "presupuesto-generico",
  },
);

const route = useRoute();
const file = ref<File | null>(null);

const fileName = computed(() => file.value?.name || "Ningún archivo seleccionado");

const emptyToNull = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUtm(query: Record<string, unknown>) {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(query || {})) {
    if (!key.toLowerCase().startsWith("utm_")) continue;

    if (Array.isArray(value)) out[key] = String(value[0] ?? "");
    else if (value == null) out[key] = "";
    else out[key] = String(value);
  }

  return Object.keys(out).length ? out : null;
}

const utm = computed(() => normalizeUtm(route.query as Record<string, unknown>));

// El endpoint limita sourceUrl a 300 caracteres.
const sourceUrl = computed(() => {
  const url = import.meta.client ? window.location.href : route.fullPath || "/";
  return String(url).slice(0, 300);
});

const schema = toTypedSchema(
  z.object({
    website: z.string().optional(),

    name: priceRequestNameSchema,

    email: priceRequestEmailSchema,

    phone: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      priceRequestPhoneSchema,
    ),

    productType: z.preprocess(emptyToNull, z.string().nullable().optional()),

    message: z.preprocess(
      emptyToNull,
      priceRequestMessageSchema,
    ),

    needAdvice: z.boolean().optional(),

    consent: priceRequestConsentSchema,
  }),
);

const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    website: "",
    name: "",
    email: "",
    phone: "",
    productType: "",
    message: "",
    needAdvice: false,
    consent: false,
  },
});

const { createPriceRequest, error, isLoading, success } = usePriceRequests();
const tracking = useTracking();

function getTrackingContext(): TrackingContext {
  return {
    pageType: "crm",
    pageLanguage: "es",
    contentGroup: "presupuesto",
    serviceName: props.productName,
    productSlug: props.productSlug || undefined,
    categorySlug: props.categorySlug,
    formId: "generic_quote_form",
    formName: "price_request",
  };
}

const leadTracking = useLeadFormTracking(getTrackingContext);

function controlClass(errorMessage?: string) {
  return cn("rd-form-control", errorMessage && "rd-form-control--error");
}

function textareaClass(errorMessage?: string) {
  return cn("rd-form-textarea", errorMessage && "rd-form-control--error");
}

function checkPanelClass(errorMessage?: string) {
  return cn("rd-form-check-panel", errorMessage && "rd-form-check-panel--error");
}

function onPickFile(event: Event) {
  const input = event.target as HTMLInputElement;
  file.value = input.files?.[0] ?? null;
}

const onSubmit = handleSubmit(
  async (values) => {
    if (isLoading.value) return;

    error.value = null;
    success.value = false;

    // Honeypot: respuesta silenciosa, sin crear solicitud real.
    if (cleanString(values.website)) {
      await navigateTo({
        path: "/gracias",
        query: { kind: "presupuesto" },
      });
      return;
    }

    const payload = {
      website: cleanString(values.website) || null,

      name: cleanString(values.name),
      email: cleanString(values.email),
      phone: cleanString(values.phone),
      company: null,

      message: cleanString(values.message) || "Solicitud de presupuesto",

      categorySlug: props.categorySlug || "presupuesto",

      product: {
        name: props.productName || "Presupuesto genérico",
        slug: props.productSlug || null,
        sku: null,
        url: sourceUrl.value,
      },

      extras: {
        productType: cleanString(values.productType) || null,
        needAdvice: values.needAdvice === true,
        fileName: file.value?.name || null,
        page: "pedir-presupuesto",
      },

      consent: values.consent === true,
      sourceUrl: sourceUrl.value,
      utm: utm.value,
      tracking: tracking.getTrackingPayloadForLead(getTrackingContext()),
      initialStatus: "Nova",
    };

    try {
      const response = await leadTracking.submitAndTrack(() =>
        createPriceRequest(
          payload,
          props.submitEndpoint,
          file.value,
          "design",
        ),
      );

      if (!response || !success.value) return;

      resetForm();
      file.value = null;

      await navigateTo({
        path: "/gracias",
        query: { kind: "presupuesto" },
      });
    } catch (submitError) {
      const fields = getPriceRequestClientValidationFields(submitError);
      if (fields) leadTracking.trackValidationError(fields);
      // usePriceRequests conserva el mensaje de backend y los datos del formulario.
    }
  },
  (ctx) => {
    if (isLoading.value) return;

    leadTracking.trackValidationError(Object.keys(ctx.errors));
    const firstError = Object.values(ctx.errors)[0];

    error.value =
      firstError || "Revisa los campos obligatorios antes de enviar la solicitud.";
  },
);
</script>

<template>
  <div class="rd-form-frame mx-auto max-w-xl">
    <form
      @submit.prevent="onSubmit"
      @pointerdown.capture="leadTracking.onFormInteraction"
      @keydown.capture="leadTracking.onFormInteraction"
      @input.capture="leadTracking.onFormInteraction"
      @change.capture="leadTracking.onFormInteraction"
      novalidate
      class="rd-form-shell"
    >
      <div v-if="error" class="rd-form-alert border border-destructive/20 bg-destructive/5 px-4 py-3">
        <p class="text-center text-sm font-medium text-destructive">
          {{ error }}
        </p>
      </div>

      <div class="rd-form-body">
        <div class="rd-form-stack">
          <FormField name="name" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel class="rd-form-label">
                Nombre <span class="rd-form-required">*</span>
              </FormLabel>

              <FormControl>
                <Input
                  v-bind="componentField"
                  autocomplete="name"
                  placeholder="Ej. Juan Pérez"
                  :class="controlClass(errorMessage)"
                />
              </FormControl>

              <FormMessage class="mt-1" />
            </FormItem>
          </FormField>

          <FormField name="email" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel class="rd-form-label">
                Email <span class="rd-form-required">*</span>
              </FormLabel>

              <FormControl>
                <Input
                  v-bind="componentField"
                  type="email"
                  autocomplete="email"
                  placeholder="nombre@empresa.com"
                  :class="controlClass(errorMessage)"
                />
              </FormControl>

              <FormMessage class="mt-1" />
            </FormItem>
          </FormField>

          <FormField name="phone" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel class="rd-form-label">
                Teléfono <span class="rd-form-required">*</span>
              </FormLabel>

              <FormControl>
                <Input
                  v-bind="componentField"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  required
                  placeholder="+34 600 000 000"
                  :class="controlClass(errorMessage)"
                />
              </FormControl>

              <FormMessage class="mt-1" />
            </FormItem>
          </FormField>

          <FormField name="productType" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel class="rd-form-label">
                Tipo de producto <span class="rd-form-inline-note">(Opcional)</span>
              </FormLabel>

              <FormControl>
                <Select
                  :model-value="componentField.modelValue || undefined"
                  @update:model-value="componentField.onChange"
                >
                  <SelectTrigger data-field-name="productType" :class="controlClass(errorMessage)">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="adhesivos">Adhesivos</SelectItem>
                    <SelectItem value="gran-formato">Gran formato</SelectItem>
                    <SelectItem value="expositores">Expositores</SelectItem>
                    <SelectItem value="publicaciones">Publicaciones</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>

              <FormMessage class="mt-1" />
            </FormItem>
          </FormField>

          <FormField name="message" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel class="rd-form-label">
                Descripción <span class="rd-form-inline-note">(Opcional)</span>
              </FormLabel>

              <FormControl>
                <Textarea
                  v-bind="componentField"
                  placeholder="Qué necesitas, cantidad aproximada, medidas, ¿tienes diseño?..."
                  :class="textareaClass(errorMessage)"
                />
              </FormControl>

              <FormMessage class="mt-1" />
            </FormItem>
          </FormField>

          <FormField name="website" v-slot="{ componentField }">
            <input
              v-bind="componentField"
              class="hidden"
              tabindex="-1"
              autocomplete="off"
              aria-hidden="true"
            />
          </FormField>

          <div class="rd-form-section">
            <label class="rd-form-label">
              Adjuntar archivo <span class="rd-form-inline-note">(Opcional)</span>
            </label>

            <label class="rd-form-upload">
              <span class="rd-form-upload-button">
                Seleccionar archivo
              </span>

              <span class="rd-form-upload-text">
                {{ fileName }}
              </span>

              <input
                type="file"
                name="attachment"
                class="sr-only"
                accept=".pdf,.jpg,.jpeg,.png,.ai,.eps,.svg,.zip"
                @change="onPickFile"
              />
            </label>
          </div>

          <FormField name="needAdvice" v-slot="{ componentField }">
            <FormItem class="space-y-0">
              <label class="rd-form-check-panel" for="need-advice-check">
                <FormControl>
                  <input
                    id="need-advice-check"
                    name="needAdvice"
                    type="checkbox"
                    class="rd-form-checkbox"
                    :checked="componentField.modelValue === true"
                    @change="
                      (event) =>
                        componentField.onChange(
                          (event.target as HTMLInputElement).checked,
                        )
                    "
                    @blur="componentField.onBlur"
                  />
                </FormControl>

                <span class="rd-form-privacy-text">
                  Necesito asesoramiento
                </span>
              </label>
            </FormItem>
          </FormField>

          <FormField name="consent" v-slot="{ componentField, errorMessage }">
            <FormItem class="space-y-0">
              <label :class="checkPanelClass(errorMessage)" for="privacy-check">
                <FormControl>
                  <input
                    id="privacy-check"
                    name="consent"
                    type="checkbox"
                    class="rd-form-checkbox"
                    :checked="componentField.modelValue === true"
                    @change="
                      (event) =>
                        componentField.onChange(
                          (event.target as HTMLInputElement).checked,
                        )
                    "
                    @blur="componentField.onBlur"
                  />
                </FormControl>

                <span class="rd-form-privacy-text">
                  He leído y acepto la
                  <NuxtLink
                    to="/politica-privacidad"
                    target="_blank"
                    class="rd-form-link"
                  >
                    política de privacidad
                  </NuxtLink>
                  .
                </span>
              </label>

              <FormMessage class="mt-2 block" />
            </FormItem>
          </FormField>
        </div>
      </div>

      <div class="rd-form-footer">
        <AppButton
  type="submit"
  :disabled="isLoading"
  :loading="isLoading"
  size="lg"
  block
>
  {{ isLoading ? "Enviando solicitud..." : "Solicitar presupuesto" }}
</AppButton>
      </div>
    </form>
  </div>
</template>
