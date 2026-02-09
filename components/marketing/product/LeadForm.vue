<script setup lang="ts">
import { computed, watch, ref } from "vue";
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
import { Textarea } from "@/components/ui/textarea";

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
    categorySlug: string; // ✅ NECESARIO para /api/price-requests
    extraFields?: ExtraField[];
    productData?: any;
  }>(),
  { extraFields: () => [] }
);

const route = useRoute();
const open = ref(false);

// Figma: archivo (de momento guardamos sólo el nombre)
const fileRef = ref<File | null>(null);
const fileName = computed(() => fileRef.value?.name || "Ningún archivo seleccionado");
function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement;
  fileRef.value = input.files?.[0] || null;
}

const BASE_FIELDS = [
  "cantidad",
  "comentario",
  "privacy",
  "nombre",
  "email",
  "telefono",
  "empresa",
];

const extraFields = computed(() =>
  (props.extraFields || []).filter((f) => !BASE_FIELDS.includes(f.name))
);

function schemaForField(f: {
  type?: string;
  required?: boolean;
  label: string;
  options?: string[];
}) {
  const req = !!f.required;

  if (f.type === "number") {
    return req
      ? z.coerce.number().min(0, `El campo ${f.label} es obligatorio`)
      : z.coerce.number().optional().nullable();
  }

  // select o text: string
  return req
    ? z.string().min(1, `El campo ${f.label} es obligatorio`)
    : z.string().optional().nullable();
}

const dynamicSchema = computed(() => {
  const base: Record<string, z.ZodTypeAny> = {
    // ✅ visibles (Figma)
    cantidad: z.coerce.number().min(1, "La cantidad mínima es 1"),
    comentario: z.string().min(1, "La descripción es obligatoria"), // ✅ endpoint exige message
    privacy: z.literal(true, {
      errorMap: () => ({ message: "Debes aceptar la política de privacidad" }),
    }),

    // ✅ en dialog
    nombre: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Correo inválido"),
    telefono: z.string().optional().nullable(),
    empresa: z.string().optional().nullable(),
  };

  for (const f of extraFields.value) base[f.name] = schemaForField(f);
  return toTypedSchema(z.object(base));
});

const initialExtraValues = computed(() =>
  Object.fromEntries(extraFields.value.map((f) => [f.name, ""]))
);

const { handleSubmit, resetForm, validateField, setFieldTouched } = useForm({
  validationSchema: dynamicSchema,
  initialValues: {
    cantidad: 1,
    comentario: "",
    privacy: false,

    nombre: "",
    email: "",
    telefono: "",
    empresa: "",

    ...initialExtraValues.value,
  },
});

watch(extraFields, () => {
  resetForm({
    values: {
      cantidad: 1,
      comentario: "",
      privacy: false,
      nombre: "",
      email: "",
      telefono: "",
      empresa: "",
      ...initialExtraValues.value,
    },
  });
});

const { sendPriceRequest, isLoading, error, success } = usePriceRequests();

// ✅ Botón Figma: valida SOLO campos visibles + extras y abre dialog
async function openDialog() {
  error.value = null;
  success.value = false;

  const fieldsToCheck = [
    "cantidad",
    "comentario",
    "privacy",
    ...extraFields.value.map((f) => f.name),
  ];

  let ok = true;
  for (const name of fieldsToCheck) {
    setFieldTouched(name as any, true, true);
    const res = await validateField(name as any);
    if (!res.valid) ok = false;
  }

  if (ok) open.value = true;
}

const onSubmit = handleSubmit(async (values) => {
  error.value = null;
  success.value = false;

  const slug = Array.isArray(route.params.slug)
    ? route.params.slug.at(-1)
    : String(route.params.slug || "");

  // extras dinámicos
  const extras: Record<string, unknown> = {};
  for (const f of extraFields.value) extras[f.name] = (values as any)[f.name];
  extras.cantidad = values.cantidad;
  if (fileRef.value?.name) extras.attachedFileName = fileRef.value.name;

  const productPayload = {
    name: props.producto,
    slug,
    sku: props.productData?.sku ?? props.productData?.meta?.sku ?? null,
    url: route.fullPath,
  };

  await sendPriceRequest({
    website: null, // honeypot
    name: values.nombre,
    email: values.email,
    phone: values.telefono || null,
    company: values.empresa || null,
    message: String(values.comentario || "").trim(),

    categorySlug: props.categorySlug, // ✅ obligatorio
    product: productPayload,
    extras,

    consent: values.privacy === true,
    sourceUrl: process.client ? window.location.href : route.fullPath,
    utm: route.query as any,

    initialStatus: "Afegit CRM",
  });

  if (success.value) {
    open.value = false;
    resetForm();
    fileRef.value = null;
  }
});
</script>
