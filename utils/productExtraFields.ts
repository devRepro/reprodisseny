export type ProductExtraField = {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export type NormalizedProductExtraField = ProductExtraField & {
  kind: "input" | "select" | "fixed";
  normalizedOptions: string[];
  initialValue: string | number;
};

function normalizeKey(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

const BASE_FIELDS = new Set(
  [
    "cantidad", "comentario", "observaciones", "privacy", "nombre", "email",
    "telefono", "empresa", "codigoPostal", "codigo postal", "código postal",
    "cp", "postalCode", "website",
  ].map(normalizeKey),
);

export function normalizeProductExtraField(
  field: ProductExtraField,
): NormalizedProductExtraField | null {
  const safeName = String(field.name || "").trim();
  const safeLabel = String(field.label || field.name || "").trim();
  const safeType = field.type || "text";

  if (!safeName || !safeLabel || BASE_FIELDS.has(normalizeKey(safeName))) {
    return null;
  }

  const normalizedOptions = (field.options || [])
    .map((option) => String(option).trim())
    .filter(Boolean);

  if (safeType === "select") {
    if (normalizedOptions.length === 0) return null;

    return {
      ...field,
      name: safeName,
      label: safeLabel,
      kind: normalizedOptions.length === 1 ? "fixed" : "select",
      normalizedOptions,
      initialValue: normalizedOptions.length === 1 ? normalizedOptions[0] : "",
    };
  }

  return {
    ...field,
    name: safeName,
    label: safeLabel,
    type: safeType,
    kind: "input",
    normalizedOptions,
    initialValue: "",
  };
}

export function getNamedValue(values: object, name: string): unknown {
  return Object.entries(values).find(([key]) => key === name)?.[1];
}
