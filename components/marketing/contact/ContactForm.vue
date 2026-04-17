<script setup lang="ts">
import { useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useRoute } from "#imports";
import { Loader2 } from "lucide-vue-next";

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
import { Button } from "@/components/ui/button";

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
    consulta: z
      .string()
      .min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")
      .max(5000),
    consent: z.literal(true, {
      errorMap: () => ({
        message: "Es necesario aceptar la política de privacidad",
      }),
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
    nombre: values.nombre,
    email: values.email,
    telefono: values.telefono ?? null,
    mensaje: values.consulta,
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
  <div class="mx-auto w-full max-w-[550px]">
    <form
      @submit.prevent="onSubmit"
      novalidate
      class="flex flex-col gap-6"
    >
      <div class="flex flex-col gap-5">
        <FormField v-slot="{ componentField, errorMessage }" name="nombre">
          <FormItem>
            <FormLabel class="text-base font-normal text-gray-900">
              Nombre
            </FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                autocomplete="name"
                placeholder="Ej. Juan Pérez"
                class="h-11 rounded-lg border-gray-300 shadow-sm transition-all duration-200 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20"
                :class="{ 'border-red-500 focus:ring-red-200': errorMessage }"
              />
            </FormControl>
            <FormMessage class="mt-1 text-sm" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="email">
          <FormItem>
            <FormLabel class="text-base font-normal text-gray-900">
              Email
            </FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="email"
                autocomplete="email"
                placeholder="nombre@empresa.com"
                class="h-11 rounded-lg border-gray-300 shadow-sm transition-all duration-200 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20"
                :class="{ 'border-red-500 focus:ring-red-200': errorMessage }"
              />
            </FormControl>
            <FormMessage class="mt-1 text-sm" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="telefono">
          <FormItem>
            <FormLabel class="text-base font-normal text-gray-900">
              Teléfono
              <span class="ml-1 text-sm text-gray-400">(Opcional)</span>
            </FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="+34 600 000 000"
                class="h-11 rounded-lg border-gray-300 shadow-sm transition-all duration-200 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20"
                :class="{ 'border-red-500 focus:ring-red-200': errorMessage }"
              />
            </FormControl>
            <FormMessage class="mt-1 text-sm" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, errorMessage }" name="consulta">
          <FormItem>
            <FormLabel class="text-base font-normal text-gray-900">
              Consulta
            </FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                placeholder="¿En qué podemos ayudarte?"
                class="min-h-[160px] resize-y rounded-lg border-gray-300 shadow-sm transition-all duration-200 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20"
                :class="{ 'border-red-500 focus:ring-red-200': errorMessage }"
              />
            </FormControl>
            <FormMessage class="mt-1 text-sm" />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="website">
          <input
            v-bind="componentField"
            class="absolute -z-10 h-0 w-0 hidden opacity-0"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />
        </FormField>
      </div>

      <div class="mt-2">
        <FormField v-slot="{ componentField }" name="consent">
          <FormItem class="space-y-0">
            <div class="flex items-start gap-3">
              <FormControl>
                <input
                  id="privacy-check"
                  type="checkbox"
                  class="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 text-[#0076B3] focus:ring-[#0076B3]"
                  :checked="componentField.modelValue === true"
                  @change="(e) => componentField.onChange((e.target as HTMLInputElement).checked)"
                  @blur="componentField.onBlur"
                />
              </FormControl>

              <label
                for="privacy-check"
                class="cursor-pointer select-none text-sm leading-relaxed text-gray-700"
              >
                He leído y acepto la
                <a
                  href="/politica-privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded px-0.5 text-[#0076B3] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0076B3]/50"
                >
                  política de privacidad
                </a>.
              </label>
            </div>

            <FormMessage class="ml-8 mt-1 block" />
          </FormItem>
        </FormField>
      </div>

      <Button
        type="submit"
        :disabled="isLoading"
        class="mt-2 h-12 w-full rounded-lg bg-[#0076B3] text-base font-medium text-white shadow-md transition-all active:scale-[0.98] hover:bg-[#006599] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Loader2 v-if="isLoading" class="mr-2 h-5 w-5 animate-spin" />
        {{ isLoading ? "Enviando mensaje..." : "Contactar con un experto" }}
      </Button>

      <div
        v-if="error"
        class="rounded-lg border border-red-100 bg-red-50 p-3 animate-in fade-in"
      >
        <p class="flex items-center justify-center gap-2 text-center text-sm font-medium text-red-600">
          <span>⚠️</span> {{ error }}
        </p>
      </div>
    </form>
  </div>
</template>