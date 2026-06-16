<script setup lang="ts">
import { useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useRoute } from "#imports";

import { useSendContact } from "@/composables/useSendContact";

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

function normalizeUtm(q: Record<string, any>) {
  const out: Record<string, string> = {};

  for (const [k, v] of Object.entries(q || {})) {
    if (Array.isArray(v)) out[k] = String(v[0] ?? "");
    else if (v == null) out[k] = "";
    else out[k] = String(v);
  }

  return out;
}

const onSubmit = handleSubmit(async (values) => {
  error.value = null;
  success.value = false;

  // Honeypot
  if (values.website && values.website.trim()) {
    return;
  }

  await sendContact({
    nombre: values.nombre.trim(),
    email: values.email.trim(),
    telefono: values.telefono?.trim() || null,
    codigoPostal: values.codigoPostal?.trim() || null,
    consulta: values.consulta.trim(),
    consent: values.consent,
    origen: "contact-page",
    utm: normalizeUtm(route.query as any),
    sourceUrl: route.fullPath,
    website: values.website,
  });

  if (success.value) {
    await navigateTo({
      path: "/gracias",
      query: { kind: "contacto" },
    });
  }
});
</script>

<template>
  <div class="form-shell">
    <form @submit.prevent="onSubmit" novalidate class="form">
      <div class="form-grid">
        <FormField v-slot="{ componentField, errorMessage }" name="nombre">
          <FormItem>
            <FormLabel class="form-label">Nombre</FormLabel>
            <FormControl>
              <Input v-bind="componentField" autocomplete="name" placeholder="Ej. Juan Pérez" class="form-control"
                :class="{ 'form-control-error': errorMessage }" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="email">
          <FormItem>
            <FormLabel class="form-label">Email</FormLabel>
            <FormControl>
              <Input v-bind="componentField" type="email" autocomplete="email" placeholder="nombre@empresa.com"
                class="form-control" :class="{ 'form-control-error': errorMessage }" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid gap-5 md:grid-cols-2">
          <FormField v-slot="{ componentField, errorMessage }" name="telefono">
            <FormItem>
              <FormLabel class="form-label">
                Teléfono
                <span class="form-label-muted">(Opcional)</span>
              </FormLabel>
              <FormControl>
                <Input v-bind="componentField" type="tel" inputmode="tel" autocomplete="tel"
                  placeholder="+34 600 000 000" class="form-control" :class="{ 'form-control-error': errorMessage }" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, errorMessage }" name="codigoPostal">
            <FormItem>
              <FormLabel class="form-label">
                Código postal
                <span class="form-label-muted">(Opcional)</span>
              </FormLabel>
              <FormControl>
                <Input v-bind="componentField" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5"
                  placeholder="08001" class="form-control" :class="{ 'form-control-error': errorMessage }" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField, errorMessage }" name="consulta">
          <FormItem>
            <FormLabel class="form-label">Consulta</FormLabel>
            <FormControl>
              <Textarea v-bind="componentField" placeholder="¿En qué podemos ayudarte?"
                class="form-control form-textarea form-textarea-lg" :class="{ 'form-control-error': errorMessage }" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="website">
          <input v-bind="componentField" class="absolute -z-10 hidden h-0 w-0 opacity-0" tabindex="-1"
            autocomplete="off" aria-hidden="true" />
        </FormField>
      </div>

      <FormField v-slot="{ componentField }" name="consent">
        <FormItem class="space-y-0">
          <div class="form-consent">
            <FormControl>
              <input id="privacy-check" type="checkbox" class="form-checkbox"
                :checked="componentField.modelValue === true"
                @change="(e) => componentField.onChange((e.target as HTMLInputElement).checked)"
                @blur="componentField.onBlur" />
            </FormControl>

            <label for="privacy-check" class="form-consent-label">
              He leído y acepto la
              <a href="/politica-privacidad" target="_blank" rel="noopener noreferrer" class="form-link">
                política de privacidad
              </a>.
            </label>
          </div>

          <FormMessage class="ml-8 mt-1 block" />
        </FormItem>
      </FormField>

      <AppButton type="submit" :disabled="isLoading" :loading="isLoading" size="lg" block>
        {{ isLoading ? "Enviando mensaje..." : "Contactar con un experto" }}
      </AppButton>

      <div v-if="error" class="form-error animate-in fade-in">
        <p class="flex items-center justify-center gap-2 text-center">
          <span>⚠️</span> {{ error }}
        </p>
      </div>
    </form>
  </div>
</template>
