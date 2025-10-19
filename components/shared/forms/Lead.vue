<script setup lang="ts">
import { computed, watch } from "vue";
import { useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useSendLead } from "@/composables/useSendLead";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ExtraField = {
  name: string;
  label: string;
  type?: "text" | "number" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

const props = withDefaults(
  defineProps<{
    producto: string;
    extraFields?: ExtraField[];
    /** front-matter completo del producto (slug, sku, formFields, etc.) */
    productData?: any;
  }>(),
  {
    extraFields: () => [],
  }
);

const extraFields = computed(() => props.extraFields);

/** Zod por tipo dinámico */
function schemaForField(f: { type?: string; required?: boolean; label: string }) {
  const req = !!f.required;
  switch (f.type) {
    case "number":
      return req
        ? z.coerce.number().min(0, `El campo ${f.label} es obligatorio`)
        : z.coerce.number().optional().nullable();
    default:
      return req
        ? z.string().min(1, `El campo ${f.label} es obligatorio`)
        : z.string().optional().nullable();
  }
}

/** Esquema reactivo (nombre + email + campos extra) */
const dynamicSchema = computed(() => {
  const base: Record<string, z.ZodTypeAny> = {
    nombre: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Correo inválido"),
  };
  for (const f of extraFields.value) base[f.name] = schemaForField(f);
  return toTypedSchema(z.object(base));
});

/** Valores iniciales para los extras */
const initialExtraValues = computed(() =>
  Object.fromEntries(
    extraFields.value.map((f) => [f.name, f.type === "number" ? "" : ""])
  )
);

const { handleSubmit, resetForm } = useForm({
  validationSchema: dynamicSchema,
  initialValues: {
    nombre: "",
    email: "",
    ...initialExtraValues.value,
  },
});

/** Si cambian los campos extra, re-inicializa el formulario */
watch(extraFields, () => {
  resetForm({
    values: {
      nombre: "",
      email: "",
      ...initialExtraValues.value,
    },
  });
});

const { sendLead, isLoading, error, success } = useSendLead();

/** Envío */
const onSubmit = handleSubmit(async (values) => {
  error.value = null;
  success.value = false;

  // Normaliza numéricos definidos como number
  const cleaned: Record<string, any> = { ...values };
  for (const f of extraFields.value) {
    if (f.type === "number" && cleaned[f.name] !== "" && cleaned[f.name] != null) {
      const n = Number(cleaned[f.name]);
      if (!Number.isNaN(n)) cleaned[f.name] = n;
    }
  }

  await sendLead({
    ...cleaned, // incluye dinámicos: p.ej. color, texto, etc.
    producto: props.producto,
    productData: props.productData, // 👈 objeto completo del producto
    origen: "product-page",
    utm: useRoute().query as any,
  });

  if (success.value) resetForm();
});
</script>

<template>
  <form @submit.prevent="onSubmit" class="grid gap-4" novalidate>
    <FormField name="nombre" v-slot="{ componentField }">
      <FormItem>
        <FormLabel>Nombre</FormLabel>
        <FormControl>
          <Input
            v-bind="componentField"
            autocomplete="name"
            placeholder="Tu nombre completo"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="email" v-slot="{ componentField }">
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input
            v-bind="componentField"
            type="email"
            autocomplete="email"
            placeholder="correo@mail.com"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Campos dinámicos -->
    <FormField
      v-for="f in extraFields"
      :key="f.name"
      :name="f.name"
      v-slot="{ componentField }"
    >
      <FormItem>
        <FormLabel>{{ f.label }}</FormLabel>
        <FormControl>
          <!-- SELECT nativo -->
          <template v-if="f.type === 'select'">
            <select
              class="w-full px-3 py-2 border rounded text-sm bg-background"
              :name="componentField.name"
              :id="componentField.id"
              :value="(componentField as any).modelValue ?? ''"
              @change="e => (componentField as any).onChange((e.target as HTMLSelectElement).value)"
              @blur="componentField.onBlur"
            >
              <option disabled value="">Selecciona una opción</option>
              <option v-for="opt in f.options || []" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
          </template>

          <!-- NUMBER / TEXT -->
          <template v-else>
            <Input
              v-bind="componentField"
              :type="f.type === 'number' ? 'number' : f.type || 'text'"
              :placeholder="f.placeholder || ''"
              :inputmode="f.type === 'number' ? 'decimal' : undefined"
            />
          </template>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" :disabled="isLoading" class="mt-4 w-fit">
      {{ isLoading ? "Enviando…" : "Enviar solicitud" }}
    </Button>

    <p v-if="error" class="text-sm font-medium text-destructive mt-2">{{ error }}</p>
    <p v-if="success" class="text-sm font-medium text-emerald-600 mt-2">
      ¡Solicitud enviada con éxito!
    </p>
  </form>
</template>
