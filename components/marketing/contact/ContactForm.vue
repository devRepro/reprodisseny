<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useRoute } from "#imports";
import { cn } from "@/lib/utils";
import { useSendContact } from "@/composables/useSendContact";
import { useTracking } from "@/composables/useTracking";
import { useLeadFormTracking } from "@/composables/useLeadFormTracking";
import { contactFormSchema } from "~/shared/schemas/contact";
import type { TrackingContext } from "~/types/tracking";

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

const schema = toTypedSchema(contactFormSchema);

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
const tracking = useTracking();
const leadTracking = useLeadFormTracking(getTrackingContext);

function getTrackingContext(): TrackingContext {
  return {
    pageType: "contact",
    pageLanguage: "es",
    contentGroup: "contacto",
    serviceName: "Consulta web",
    categorySlug: "contacte",
    formId: "contact_form",
    formName: "contact_form",
  };
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
  if (isLoading.value || success.value) return;

  const trackingPayload = tracking.getTrackingPayloadForLead(getTrackingContext());

  const response = await leadTracking.submitAndTrack(() => sendContact({
    nombre: values.nombre.trim(),
    email: values.email.trim(),
    telefono: values.telefono?.trim() || null,
    codigoPostal: values.codigoPostal?.trim() || null,
    consulta: values.consulta.trim(),
    consent: values.consent,
    origen: "contact-page",
    utm: trackingPayload.routeUtm ?? {},
    sourceUrl: trackingPayload.sourceUrl || route.fullPath,
    tracking: trackingPayload,
    website: values.website,
  }), { waitForTracking: true });

  if (response && success.value) {
    await navigateTo({
      path: "/gracias",
      query: { kind: "contacto" },
    });
  }
});
</script>

<template>
  <div class="rd-form-frame mx-auto max-w-xl">
    <form @submit.prevent="onSubmit" novalidate class="rd-form-shell"
      @pointerdown.capture="leadTracking.onFormInteraction"
      @keydown.capture="leadTracking.onFormInteraction"
      @input.capture="leadTracking.onFormInteraction"
      @change.capture="leadTracking.onFormInteraction">
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

        <div v-if="error" role="alert" class="rd-form-alert rd-form-alert--destructive animate-in fade-in">
          <p class="text-center">
            {{ error }}
          </p>
        </div>
      </div>
    </form>
  </div>
</template>
