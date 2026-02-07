<script setup lang="ts">
import { useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useRoute } from "#imports";
import { useSendContact } from "@/composables/useSendContact";
import { Loader2, CheckCircle2 } from "lucide-vue-next"; // Iconos sugeridos para feedback visual

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

// Esquema mejorado
const schema = toTypedSchema(
  z.object({
    nombre: z.string().min(2, "Ingresa un nombre válido"), // Min 1 es muy poco
    email: z.string().email("Introduce un correo electrónico válido"),
    telefono: z
      .string()
      .regex(/^[\d\s\+\-]*$/, "Solo se permiten números y símbolos válidos") // Validación básica de formato
      .optional()
      .nullable(),
    consulta: z
      .string()
      .min(10, "Cuéntanos un poco más (mínimo 10 caracteres)") // Evitar mensajes vacíos reales
      .max(5000),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Es necesario aceptar la política de privacidad" }),
    }),
    website: z.string().optional(), // honeypot
  })
);

const { handleSubmit, resetForm } = useForm({
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

// Utilidad extraída para limpieza
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

  // Honeypot check
  if (values.website && values.website.trim()) {
    success.value = true; // Fake success para bots
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
    resetForm();
    // Opcional: Scroll al mensaje de éxito si el formulario es muy largo
  }
});
</script>

<template>
  <div class="mx-auto w-full max-w-[550px]">
    <div
      v-if="success"
      class="flex flex-col items-center justify-center p-8 text-center bg-emerald-50 rounded-xl border border-emerald-100 min-h-[300px] animate-in fade-in slide-in-from-bottom-4"
    >
      <CheckCircle2 class="w-16 h-16 text-emerald-600 mb-4" />
      <h3 class="text-2xl font-bold text-emerald-800 font-['Figtree'] mb-2">
        ¡Mensaje enviado!
      </h3>
      <p class="text-emerald-700 font-['Figtree']">
        Gracias por contactarnos. Un experto revisará tu consulta y te responderá a la
        brevedad.
      </p>
      <Button
        variant="outline"
        class="mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
        @click="success = false"
      >
        Enviar otro mensaje
      </Button>
    </div>

    <form v-else @submit.prevent="onSubmit" novalidate class="flex flex-col gap-6">
      <div class="flex flex-col gap-5">
        <FormField name="nombre" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel class="font-['Figtree'] text-base font-normal text-gray-900">
              Nombre
            </FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                autocomplete="name"
                placeholder="Ej. Juan Pérez"
                class="h-11 rounded-lg border-gray-300 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20 shadow-sm transition-all duration-200"
                :class="{ 'border-red-500 focus:ring-red-200': errorMessage }"
              />
            </FormControl>
            <FormMessage class="font-['Figtree'] text-sm mt-1" />
          </FormItem>
        </FormField>

        <FormField name="email" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel class="font-['Figtree'] text-base font-normal text-gray-900">
              Email
            </FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="email"
                autocomplete="email"
                placeholder="nombre@empresa.com"
                class="h-11 rounded-lg border-gray-300 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20 shadow-sm transition-all duration-200"
                :class="{ 'border-red-500 focus:ring-red-200': errorMessage }"
              />
            </FormControl>
            <FormMessage class="font-['Figtree'] text-sm mt-1" />
          </FormItem>
        </FormField>

        <FormField name="telefono" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel class="font-['Figtree'] text-base font-normal text-gray-900">
              Teléfono <span class="text-gray-400 text-sm ml-1">(Opcional)</span>
            </FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="+34 600 000 000"
                class="h-11 rounded-lg border-gray-300 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20 shadow-sm transition-all duration-200"
                :class="{ 'border-red-500 focus:ring-red-200': errorMessage }"
              />
            </FormControl>
            <FormMessage class="font-['Figtree'] text-sm mt-1" />
          </FormItem>
        </FormField>

        <FormField name="consulta" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel class="font-['Figtree'] text-base font-normal text-gray-900">
              Consulta
            </FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                placeholder="¿En qué podemos ayudarte?"
                class="min-h-[160px] resize-y rounded-lg border-gray-300 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20 shadow-sm transition-all duration-200"
                :class="{ 'border-red-500 focus:ring-red-200': errorMessage }"
              />
            </FormControl>
            <FormMessage class="font-['Figtree'] text-sm mt-1" />
          </FormItem>
        </FormField>

        <FormField name="website" v-slot="{ componentField }">
          <input
            v-bind="componentField"
            class="hidden opacity-0 w-0 h-0 absolute -z-10"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />
        </FormField>
      </div>

      <div class="mt-2">
        <FormField name="consent" v-slot="{ componentField, errorMessage }">
          <FormItem class="space-y-0">
            <div class="flex items-start gap-3">
              <FormControl>
                <input
                  type="checkbox"
                  id="privacy-check"
                  class="mt-1 h-5 w-5 rounded border-gray-300 text-[#0076B3] focus:ring-[#0076B3] cursor-pointer"
                  :checked="componentField.modelValue === true"
                  @change="(e) => componentField.onChange((e.target as HTMLInputElement).checked)"
                  @blur="componentField.onBlur"
                />
              </FormControl>
              <label
                for="privacy-check"
                class="text-sm font-['Figtree'] leading-relaxed text-gray-700 cursor-pointer select-none"
              >
                He leído y acepto la
                <a
                  href="/aviso-legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[#0076B3] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0076B3]/50 rounded px-0.5"
                >
                  política de privacidad </a
                >.
              </label>
            </div>
            <FormMessage class="ml-8 mt-1 block" />
          </FormItem>
        </FormField>
      </div>

      <Button
        type="submit"
        :disabled="isLoading"
        class="w-full h-12 mt-2 rounded-lg bg-[#0076B3] hover:bg-[#006599] disabled:opacity-70 disabled:cursor-not-allowed font-['Figtree'] text-base font-medium text-white shadow-md transition-all active:scale-[0.98]"
      >
        <Loader2 v-if="isLoading" class="mr-2 h-5 w-5 animate-spin" />
        {{ isLoading ? "Enviando mensaje..." : "Contactar con un experto" }}
      </Button>

      <div
        v-if="error"
        class="p-3 bg-red-50 border border-red-100 rounded-lg animate-in fade-in"
      >
        <p
          class="text-sm font-medium text-red-600 text-center flex items-center justify-center gap-2"
        >
          <span>⚠️</span> {{ error }}
        </p>
      </div>
    </form>
  </div>
</template>
