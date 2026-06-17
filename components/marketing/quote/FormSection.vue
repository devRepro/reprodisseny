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

import { usePriceRequests } from "@/composables/usePriceRequests";
import { cn } from "@/lib/utils";

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

    name: z.string().min(2, "Ingresa un nombre válido"),

    email: z.string().email("Introduce un correo electrónico válido"),

    phone: z.preprocess(
      emptyToNull,
      z
        .string()
        .regex(/^[\d\s+-]*$/, "Solo se permiten números y símbolos válidos")
        .nullable()
        .optional(),
    ),

    productType: z.preprocess(emptyToNull, z.string().nullable().optional()),

    message: z.preprocess(
      emptyToNull,
      z.string().max(4000, "El mensaje no puede superar los 4000 caracteres").nullable().optional(),
    ),

    needAdvice: z.boolean().optional(),

    consent: z.boolean().refine((value) => value === true, {
      message: "Es necesario aceptar la política de privacidad",
    }),
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
      phone: cleanString(values.phone) || null,
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
      initialStatus: "Nova",
    };

    await createPriceRequest(payload, props.submitEndpoint, file.value, "design");

    if (success.value) {
      resetForm();
      file.value = null;

      await navigateTo({
        path: "/gracias",
        query: { kind: "presupuesto" },
      });
    }
  },
  (ctx) => {
    const firstError = Object.values(ctx.errors)[0];

    error.value =
      firstError || "Revisa los campos obligatorios antes de enviar la solicitud.";
  },
);
</script>

<template>
  <div class="rd-form-frame mx-auto max-w-xl">
    <form @submit.prevent="onSubmit" novalidate class="rd-form-shell">
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
                  <SelectTrigger :class="controlClass(errorMessage)">
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
