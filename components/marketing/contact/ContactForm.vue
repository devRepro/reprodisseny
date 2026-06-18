<script setup lang="ts">
import { useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useRoute } from "#imports";
import { cn } from "@/lib/utils";
import { useSendContact } from "@/composables/useSendContact";
import { useTracking } from "@/composables/useTracking";
import type { TrackingContext, TrackingEventName } from "~/types/tracking";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppButton from "@/components/shared/button/AppButton.vue";

const route = useRoute();
const tracking = useTracking();

const schema = toTypedSchema(
  z.object({
    nombre: z.string().min(2, "Ingresa un nombre válido"),
    email: z.string().email("Introduce un correo electrónico válido"),
    telefono: z
      .string()
      .regex(/^[\d\s\+\-]*$/, "Solo se permiten números y símbolos válidos")
      .optional()
      .nullable(),
    codigoPostal: z
      .string()
      .trim()
      .refine((value) => !value || /^\d{5}$/.test(value), {
        message: "Introduce un código postal válido de 5 dígitos",
      })
      .optional()
      .nullable(),
    consulta: z
      .string()
      .min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")
      .max(5000),
    consent: z.boolean().refine((value) => value === true, {
      message: "Es necesario aceptar la política de privacidad",
    }),
    website: z.string().optional(),
  })
);

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    nombre: "",
    email: "",
    telefono: "",
    codigoPostal: "",
    consulta: "",
    consent: false,
    website: "",
  },
});

const { sendContact, isLoading, error, success } = useSendContact();

const ATTRIBUTION_QUERY_KEYS = new Set([
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
]);

function normalizeUtm(q: Record<string, any>) {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(q || {})) {
    const normalizedKey = key.toLowerCase();

    if (!normalizedKey.startsWith("utm_") && !ATTRIBUTION_QUERY_KEYS.has(normalizedKey)) {
      continue;
    }

    if (Array.isArray(value)) out[key] = String(value[0] ?? "");
    else if (value == null) out[key] = "";
    else out[key] = String(value);
  }

  return out;
}

function getSourceUrl() {
  if (import.meta.client) {
    return window.location.href.slice(0, 500);
  }

  return route.fullPath.slice(0, 500);
}

function getContactTrackingContext(): TrackingContext {
  return {
    pageType: "contact",
    pageLanguage: "es",
    contentGroup: "contacto",
    serviceName: "Contacto",
    categorySlug: "contacte",
    formId: "contact_page_form",
    formName: "contact_form",
  };
}

function getContactTrackingPayload() {
  const context = getContactTrackingContext();

  return {
    ...tracking.getTrackingPayloadForLead(context),
    routeUtm: normalizeUtm(route.query as any),
    sourceUrl: getSourceUrl(),
  };
}

function pushContactLeadEvent(requestKey?: string | number | null) {
  const normalizedRequestKey = requestKey ? String(requestKey) : null;

  tracking.pushEvent(
    "generate_lead" as TrackingEventName,
    {
      lead_type: "contact_request",
      request_key: normalizedRequestKey,
      lead_id: normalizedRequestKey,
      transaction_id: normalizedRequestKey,
      page_path: import.meta.client ? window.location.pathname : route.path,
    },
    getContactTrackingContext(),
  );
}

function controlClass(errorMessage?: string) {
  return cn("rd-form-control", errorMessage && "rd-form-control--error");
}

function textareaClass(errorMessage?: string) {
  return cn("rd-form-textarea", errorMessage && "rd-form-control--error");
}

function checkPanelClass(errorMessage?: string) {
  return cn("rd-form-check-panel", errorMessage && "rd-form-check-panel--error");
}
const onSubmit = handleSubmit(async (values) => {
  error.value = null;
  success.value = false;

  // Honeypot
  if (values.website && values.website.trim()) {
    return;
  }

  const result = await sendContact({
    nombre: values.nombre.trim(),
    email: values.email.trim(),
    telefono: values.telefono?.trim() || null,
    codigoPostal: values.codigoPostal?.trim() || null,
    consulta: values.consulta.trim(),
    consent: values.consent,
    origen: "contact-page",
    utm: normalizeUtm(route.query as any),
    tracking: getContactTrackingPayload(),
    sourceUrl: getSourceUrl(),
    website: values.website,
  });

  if (success.value) {
    const requestKey =
      result && typeof result === "object"
        ? ((result as any).item?.requestKey ?? (result as any).item?.id ?? null)
        : null;

    pushContactLeadEvent(requestKey);

    await navigateTo({
      path: "/gracias",
      query: { kind: "contacto" },
    });
  }
});
</script>

<template>
  <div class="rd-form-frame mx-auto max-w-xl">
    <form @submit.prevent="onSubmit" novalidate class="rd-form-shell">
      <div class="rd-form-body">
        <div class="rd-form-stack">
          <FormField v-slot="{ componentField, errorMessage }" name="nombre">
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

          <FormField v-slot="{ componentField, errorMessage }" name="email">
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

          <div class="grid gap-4 md:grid-cols-2">
            <FormField v-slot="{ componentField, errorMessage }" name="telefono">
              <FormItem>
                <FormLabel class="rd-form-label">
                  Teléfono <span class="rd-form-inline-note">(Opcional)</span>
                </FormLabel>

                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="tel"
                    inputmode="tel"
                    autocomplete="tel"
                    placeholder="+34 600 000 000"
                    :class="controlClass(errorMessage)"
                  />
                </FormControl>

                <FormMessage class="mt-1" />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField, errorMessage }" name="codigoPostal">
              <FormItem>
                <FormLabel class="rd-form-label">
                  Código postal <span class="rd-form-inline-note">(Opcional)</span>
                </FormLabel>

                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="text"
                    inputmode="numeric"
                    autocomplete="postal-code"
                    maxlength="5"
                    placeholder="08001"
                    :class="controlClass(errorMessage)"
                  />
                </FormControl>

                <FormMessage class="mt-1" />
              </FormItem>
            </FormField>
          </div>

          <FormField v-slot="{ componentField, errorMessage }" name="consulta">
            <FormItem>
              <FormLabel class="rd-form-label">
                Consulta <span class="rd-form-required">*</span>
              </FormLabel>

              <FormControl>
                <Textarea
                  v-bind="componentField"
                  placeholder="¿En qué podemos ayudarte?"
                  :class="textareaClass(errorMessage)"
                />
              </FormControl>

              <FormMessage class="mt-1" />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="website">
            <input
              v-bind="componentField"
              class="hidden"
              tabindex="-1"
              autocomplete="off"
              aria-hidden="true"
            />
          </FormField>

          <FormField v-slot="{ componentField, errorMessage }" name="consent">
            <FormItem class="space-y-0">
              <label :class="checkPanelClass(errorMessage)" for="contact-privacy-check">
                <FormControl>
                  <input
                    id="contact-privacy-check"
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
          {{ isLoading ? "Enviando mensaje..." : "Contactar con un experto" }}
        </AppButton>

        <div v-if="error" class="rd-form-alert rd-form-alert--destructive animate-in fade-in">
          <p class="text-center">
            {{ error }}
          </p>
        </div>
      </div>
    </form>
  </div>
</template>
