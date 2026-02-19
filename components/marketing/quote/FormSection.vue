<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "#imports";
import { useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { Loader2, CheckCircle2 } from "lucide-vue-next";

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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { usePriceRequests } from "@/composables/usePriceRequests";

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
  }
);

const route = useRoute();
const file = ref<File | null>(null);

function normalizeUtm(q: Record<string, any>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(q || {})) {
    if (!k.toLowerCase().startsWith("utm_")) continue;
    if (Array.isArray(v)) out[k] = String(v[0] ?? "");
    else if (v == null) out[k] = "";
    else out[k] = String(v);
  }
  return Object.keys(out).length ? out : null;
}

const utm = computed(() => normalizeUtm(route.query as any));

// Ojo: el endpoint limita sourceUrl a 300 chars
const sourceUrl = computed(() => {
  const url = process.client ? location.href : route.fullPath || "/";
  return String(url).slice(0, 300);
});

const schema = toTypedSchema(
  z.object({
    website: z.string().optional(), // honeypot

    name: z.string().min(2, "Ingresa un nombre válido"),
    email: z.string().email("Introduce un correo electrónico válido"),
    phone: z
      .string()
      .regex(/^[\d\s\+\-]*$/, "Solo se permiten números y símbolos válidos")
      .optional()
      .nullable(),

    productType: z.string().optional().nullable(),
    message: z.string().max(4000).optional().nullable(),
    needAdvice: z.boolean().optional(),

    consent: z.literal(true, {
      errorMap: () => ({ message: "Es necesario aceptar la política de privacidad" }),
    }),
  })
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

const { createPriceRequest, isLoading, error, success } = usePriceRequests();

function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement;
  file.value = input.files?.[0] || null;
}

const onSubmit = handleSubmit(async (values) => {
  // Honeypot
  if (values.website && values.website.trim()) {
    success.value = true;
    return;
  }

  const payload = {
    website: values.website || null,

    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone?.trim() || null,
    company: null,

    // endpoint exige message min 1
    message: (values.message || "").trim() || "Solicitud de presupuesto",

    categorySlug: props.categorySlug!,
    product: {
      name: props.productName!,
      slug: props.productSlug ?? null,
      sku: null,
      url: sourceUrl.value,
    },

    extras: {
      productType: values.productType || null,
      needAdvice: values.needAdvice === true,
      fileName: file.value?.name || null,
      page: "pedir-presupuesto",
    },

    consent: values.consent === true,
    sourceUrl: sourceUrl.value,
    utm: utm.value,
  };

  await createPriceRequest(payload, props.submitEndpoint);

  if (success.value) {
    resetForm();
    file.value = null;
  }
});
</script>

<template>
  <div class="mx-auto w-full max-w-[549px]">
    <!-- Éxito (igual que contacto) -->
    <div
      v-if="success"
      class="flex flex-col items-center justify-center p-8 text-center bg-emerald-50 rounded-xl border border-emerald-100 min-h-[300px] animate-in fade-in slide-in-from-bottom-4"
    >
      <CheckCircle2 class="w-16 h-16 text-emerald-600 mb-4" />
      <h3 class="text-2xl font-bold text-emerald-800 font-['Figtree'] mb-2">
        ¡Solicitud enviada!
      </h3>
      <p class="text-emerald-700 font-['Figtree'] whitespace-pre-line">
        Gracias. Un experto revisará tu solicitud y te responderá a la brevedad.
      </p>

      <Button
        variant="outline"
        class="mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
        @click="success = false"
      >
        Enviar otra solicitud
      </Button>
    </div>

    <form v-else @submit.prevent="onSubmit" novalidate class="flex flex-col gap-6">
      <!-- Error inline (además del toast) -->
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

      <div class="flex flex-col gap-5">
        <FormField name="name" v-slot="{ componentField, errorMessage }">
          <FormItem>
            <FormLabel class="font-['Figtree'] text-base font-normal text-gray-900">
              Nombre
            </FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                autocomplete="name"
                placeholder="Ej. Juan Pérez"
                class="h-[43px] rounded-[10px] border-gray-300 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20 shadow-sm transition-all duration-200"
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
                class="h-[43px] rounded-[10px] border-gray-300 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20 shadow-sm transition-all duration-200"
                :class="{ 'border-red-500 focus:ring-red-200': errorMessage }"
              />
            </FormControl>
            <FormMessage class="font-['Figtree'] text-sm mt-1" />
          </FormItem>
        </FormField>

        <FormField name="phone" v-slot="{ componentField, errorMessage }">
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
                class="h-[43px] rounded-[10px] border-gray-300 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20 shadow-sm transition-all duration-200"
                :class="{ 'border-red-500 focus:ring-red-200': errorMessage }"
              />
            </FormControl>
            <FormMessage class="font-['Figtree'] text-sm mt-1" />
          </FormItem>
        </FormField>

        <!-- Tipo de producto -->
        <FormField name="productType" v-slot="{ componentField }">
          <FormItem>
            <FormLabel class="font-['Figtree'] text-base font-normal text-gray-900">
              Tipo de producto <span class="text-gray-400 text-sm ml-1">(Opcional)</span>
            </FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger
                  class="h-[43px] rounded-[10px] border-gray-300 shadow-sm focus:ring-2 focus:ring-[#0076B3]/20"
                >
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adhesivos">Adhesivos</SelectItem>
                  <SelectItem value="gran-formato">Gran Formato</SelectItem>
                  <SelectItem value="expositores">Expositores</SelectItem>
                  <SelectItem value="publicaciones">Publicaciones</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        </FormField>

        <!-- Descripción -->
        <FormField name="message" v-slot="{ componentField }">
          <FormItem>
            <FormLabel class="font-['Figtree'] text-base font-normal text-gray-900">
              Descripción <span class="text-gray-400 text-sm ml-1">(Opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                placeholder="Qué necesitas, cantidad aproximada, medidas, ¿tienes diseño?..."
                class="min-h-[128px] resize-y rounded-[10px] border-gray-300 focus:border-[#0076B3] focus:ring-2 focus:ring-[#0076B3]/20 shadow-sm transition-all duration-200"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <!-- Honeypot -->
        <FormField name="website" v-slot="{ componentField }">
          <input
            v-bind="componentField"
            class="hidden opacity-0 w-0 h-0 absolute -z-10"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />
        </FormField>

        <!-- Adjuntar archivo -->
        <div class="grid gap-2 pt-1">
          <label class="font-['Figtree'] text-base font-normal text-gray-900">
            Adjuntar archivo <span class="text-gray-400 text-sm ml-1">(Opcional)</span>
          </label>

          <div class="flex items-center gap-4">
            <label
              class="inline-flex h-[28px] items-center justify-center rounded-[5px] border border-[#3F3F3F] px-[10px] text-[14px] leading-[20px] font-normal text-black cursor-pointer"
            >
              Seleccionar archivo
              <input type="file" class="hidden" @change="onPickFile" />
            </label>

            <span class="text-[14px] leading-[20px] font-normal text-[#A2A2A2] truncate">
              {{ file?.name || "Ningún archivo seleccionado" }}
            </span>
          </div>
        </div>

        <!-- Need advice -->
        <FormField name="needAdvice" v-slot="{ componentField }">
          <FormItem class="space-y-0">
            <div class="flex items-start gap-3">
              <FormControl>
                <input
                  type="checkbox"
                  class="mt-1 h-5 w-5 rounded border-gray-300 text-[#0076B3] focus:ring-[#0076B3] cursor-pointer"
                  :checked="componentField.modelValue === true"
                  @change="(e) => componentField.onChange((e.target as HTMLInputElement).checked)"
                  @blur="componentField.onBlur"
                />
              </FormControl>
              <label
                class="text-sm font-['Figtree'] leading-relaxed text-gray-700 cursor-pointer select-none"
              >
                Necesito asesoramiento
              </label>
            </div>
          </FormItem>
        </FormField>
      </div>

      <!-- Consent (igual que contacto: nativo + vee-validate) -->
      <div class="mt-1">
        <FormField name="consent" v-slot="{ componentField }">
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
                  href="/politica-privacidad"
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

      <!-- Botón: NO lo bloqueamos por “validez”, solo por loading -->
      <Button
        type="submit"
        :disabled="isLoading"
        class="w-full h-12 mt-1 rounded-lg bg-[#0076B3] hover:bg-[#006599] disabled:opacity-70 disabled:cursor-not-allowed font-['Figtree'] text-base font-medium text-white shadow-md transition-all active:scale-[0.98]"
      >
        <Loader2 v-if="isLoading" class="mr-2 h-5 w-5 animate-spin" />
        {{ isLoading ? "Enviando solicitud..." : "Contactar con un experto" }}
      </Button>
    </form>
  </div>
</template>
