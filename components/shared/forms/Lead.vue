<script setup lang="ts">
  import { computed, watch } from "vue";
  import { useForm } from "vee-validate";
  import { z } from "zod";
  import { toTypedSchema } from "@vee-validate/zod";
  import { useRoute } from "#imports";
  import { usePriceRequests } from "@/composables/usePriceRequests";
  
  import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
  } from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Textarea } from "@/components/ui/textarea";
  
  type ExtraField = {
    name: string;
    label: string;
    type?: "text" | "number" | "select" | "textarea";
    placeholder?: string;
    required?: boolean;
    options?: string[];
  };
  
  type ProductData = {
    slug?: string;
    sku?: string | null;
    path?: string;
    title?: string;
    formFields?: ExtraField[];
  } | null;
  
  const props = withDefaults(
    defineProps<{
      producto: string;
      extraFields?: ExtraField[];
      productData?: ProductData;
    }>(),
    {
      extraFields: () => [],
      productData: null,
    }
  );
  
  const route = useRoute();
  
  function normalizeKey(value: unknown) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim()
      .toLowerCase();
  }
  
  function cleanString(value: unknown) {
    return String(value ?? "").trim();
  }
  
  function isEmptyValue(value: unknown) {
    return value === "" || value === null || value === undefined;
  }
  
  function isSelectField(field: ExtraField) {
    return field.type === "select";
  }
  
  function isTextareaField(field: ExtraField) {
    return field.type === "textarea";
  }
  
  function isNumberField(field: ExtraField) {
    return field.type === "number";
  }
  
  const BASE_FIELDS = new Set(
    ["nombre", "email", "telefono", "teléfono", "empresa", "cantidad", "comentario"].map(
      normalizeKey
    )
  );
  
  const extraFields = computed<ExtraField[]>(() =>
    (props.extraFields || [])
      .map((field) => ({
        ...field,
        name: cleanString(field.name),
        label: cleanString(field.label || field.name),
        type: (field.type || "text") as ExtraField["type"],
        placeholder: cleanString(field.placeholder),
        required: Boolean(field.required),
        options: Array.isArray(field.options)
          ? field.options.map((opt) => cleanString(opt)).filter(Boolean)
          : [],
      }))
      .filter((field) => field.name && field.label)
      .filter((field) => !BASE_FIELDS.has(normalizeKey(field.name)))
  );
  
  function stringSchema(label: string, required = false) {
    if (required) {
      return z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().min(1, `El campo ${label} es obligatorio`));
    }
  
    return z.preprocess(
      (value) => (isEmptyValue(value) ? undefined : String(value).trim()),
      z.string().optional().nullable()
    );
  }
  
  function numberSchema(label: string, required = false, min = 0) {
  return z.preprocess(
    (value) => {
      if (isEmptyValue(value)) return undefined;
      const n = Number(value);
      return Number.isNaN(n) ? value : n;
    },
    required
      ? z
          .number({
            required_error: `El campo ${label} es obligatorio`,
            invalid_type_error: `El campo ${label} debe ser un número`,
          })
          .min(min, `El valor mínimo para ${label} es ${min}`)
      : z
          .number({
            invalid_type_error: `El campo ${label} debe ser un número`,
          })
          .min(min, `El valor mínimo para ${label} es ${min}`)
          .optional()
          .nullable()
  );
}
  
  function schemaForField(field: ExtraField) {
    if (field.type === "number") {
      return numberSchema(field.label, field.required, 0);
    }
  
    return stringSchema(field.label, field.required);
  }
  
  const dynamicSchema = computed(() => {
    const base: Record<string, z.ZodTypeAny> = {
      nombre: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().min(1, "El nombre es obligatorio")),
      email: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().email("Correo inválido")),
      telefono: z.preprocess(
        (value) => (isEmptyValue(value) ? undefined : String(value).trim()),
        z.string().optional().nullable()
      ),
      empresa: z.preprocess(
        (value) => (isEmptyValue(value) ? undefined : String(value).trim()),
        z.string().optional().nullable()
      ),
      cantidad: numberSchema("Cantidad", true, 1),
      comentario: z.preprocess(
        (value) => (isEmptyValue(value) ? undefined : String(value).trim()),
        z.string().optional().nullable()
      ),
    };
  
    for (const field of extraFields.value) {
      base[field.name] = schemaForField(field);
    }
  
    return toTypedSchema(z.object(base));
  });
  
  const initialExtraValues = computed(() =>
    Object.fromEntries(extraFields.value.map((field) => [field.name, ""]))
  );
  
  const initialValues = computed(() => ({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    cantidad: 1,
    comentario: "",
    ...initialExtraValues.value,
  }));
  
  const { handleSubmit, resetForm } = useForm({
    validationSchema: dynamicSchema,
    initialValues: initialValues.value,
  });
  
  watch(
    [extraFields, () => props.producto, () => props.productData?.slug],
    () => {
      resetForm({
        values: initialValues.value,
      });
    }
  );
  
  const { sendPriceRequest, isLoading, error, success } = usePriceRequests();
  
  const onSubmit = handleSubmit(async (values) => {
    error.value = null;
    success.value = false;
  
    const cleaned: Record<string, any> = { ...values };
  
    for (const field of extraFields.value) {
      if (field.type === "number") {
        if (isEmptyValue(cleaned[field.name])) {
          cleaned[field.name] = null;
        } else {
          const n = Number(cleaned[field.name]);
          cleaned[field.name] = Number.isNaN(n) ? cleaned[field.name] : n;
        }
      } else if (typeof cleaned[field.name] === "string") {
        cleaned[field.name] = cleaned[field.name].trim();
      }
    }
  
    if (!isEmptyValue(cleaned.cantidad)) {
      const n = Number(cleaned.cantidad);
      if (!Number.isNaN(n)) cleaned.cantidad = n;
    }
  
    if (typeof cleaned.nombre === "string") cleaned.nombre = cleaned.nombre.trim();
    if (typeof cleaned.email === "string") cleaned.email = cleaned.email.trim();
    if (typeof cleaned.telefono === "string") cleaned.telefono = cleaned.telefono.trim();
    if (typeof cleaned.empresa === "string") cleaned.empresa = cleaned.empresa.trim();
    if (typeof cleaned.comentario === "string") cleaned.comentario = cleaned.comentario.trim();
  
    const routeSlug = Array.isArray(route.params.slug)
      ? route.params.slug.at(-1)
      : String(route.params.slug || "");
  
    const extras: Record<string, any> = {};
    for (const field of extraFields.value) {
      extras[field.name] = cleaned[field.name];
    }
  
    const productoPayload = {
      name: props.producto,
      slug: props.productData?.slug || routeSlug || null,
      sku: props.productData?.sku ?? null,
      url: props.productData?.path || route.fullPath,
    };
  
    await sendPriceRequest({
      nombre: cleaned.nombre,
      email: cleaned.email,
      telefono: cleaned.telefono || null,
      empresa: cleaned.empresa || null,
      cantidad: cleaned.cantidad,
      comentario: cleaned.comentario || null,
      extras,
      producto: productoPayload,
      origen: "product-page",
      utm: route.query as Record<string, any>,
    });
  
    if (success.value) {
      resetForm({
        values: initialValues.value,
      });
    }
  });
  </script>
  
  <template>
    <form @submit.prevent="onSubmit" class="space-y-6" novalidate>
      <div class="space-y-1">
        <h3 class="text-lg font-semibold">Datos de contacto</h3>
        <p class="text-xs text-muted-foreground">
          Los campos marcados con <span class="font-semibold">*</span> son obligatorios.
        </p>
      </div>
  
      <div class="grid gap-4 md:grid-cols-2">
        <FormField name="nombre" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Nombre <span class="text-destructive">*</span></FormLabel>
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
            <FormLabel>Email <span class="text-destructive">*</span></FormLabel>
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
  
        <FormField name="telefono" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Teléfono</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="tel"
                autocomplete="tel"
                placeholder="Teléfono (opcional)"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
  
        <FormField name="empresa" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Empresa</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                placeholder="Nombre de la empresa (opcional)"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
  
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">Detalles del trabajo</h3>
  
        <FormField name="cantidad" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Cantidad <span class="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="number"
                min="1"
                inputmode="decimal"
                placeholder="Cantidad aproximada"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
  
        <FormField name="comentario" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Detalles del trabajo</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                rows="4"
                placeholder="Medidas, materiales, plazos, uso previsto, etc."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
  
        <div v-if="extraFields.length" class="space-y-4">
          <h4 class="text-sm font-semibold text-muted-foreground">
            Opciones específicas del producto
          </h4>
  
          <FormField
            v-for="field in extraFields"
            :key="field.name"
            :name="field.name"
            v-slot="{ componentField }"
          >
            <FormItem>
              <FormLabel>
                {{ field.label }}
                <span v-if="field.required" class="text-destructive">*</span>
              </FormLabel>
  
              <FormControl>
                <template v-if="isSelectField(field)">
                  <select
                    :id="field.name"
                    class="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    :name="componentField.name"
                    :value="(componentField as any).modelValue ?? ''"
                    @change="
                      (e) =>
                        (componentField as any).onChange(
                          (e.target as HTMLSelectElement).value
                        )
                    "
                    @blur="componentField.onBlur"
                  >
                    <option disabled value="">
                      {{ field.placeholder || "Selecciona una opción" }}
                    </option>
  
                    <option
                      v-for="option in field.options || []"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </template>
  
                <template v-else-if="isTextareaField(field)">
                  <Textarea
                    v-bind="componentField"
                    rows="4"
                    :placeholder="field.placeholder || field.label"
                  />
                </template>
  
                <template v-else>
                  <Input
                    v-bind="componentField"
                    :type="isNumberField(field) ? 'number' : 'text'"
                    :placeholder="field.placeholder || ''"
                    :inputmode="isNumberField(field) ? 'decimal' : undefined"
                  />
                </template>
              </FormControl>
  
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>
  
      <div class="pt-2">
        <Button type="submit" :disabled="isLoading" class="w-full md:w-auto">
          {{ isLoading ? "Enviando…" : "Enviar solicitud" }}
        </Button>
  
        <p v-if="error" class="mt-2 text-sm font-medium text-destructive">
          {{ error }}
        </p>
  
        <p v-if="success" class="mt-2 text-sm font-medium text-emerald-600">
          ¡Solicitud enviada con éxito!
        </p>
      </div>
    </form>
  </template>