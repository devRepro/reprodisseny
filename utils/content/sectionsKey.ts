import type {
  ContentCardVariant,
  ContentSectionKey,
  SectionInput,
} from "~/types/contentSections";

const CANONICAL_SECTION_KEYS = [
  "details",
  "benefits",
  "types",
  "formats",
  "materials",
  "finishes",
  "applications",
  "technical-specs",
] as const;

const SECTION_ALIASES: Record<string, ContentSectionKey> = {
  details: "details",
  detail: "details",
  detalles: "details",
  detailsmd: "details",
  bodymd: "details",
  description: "details",
  descripcion: "details",

  benefits: "benefits",
  benefit: "benefits",
  beneficios: "benefits",
  benefitsdata: "benefits",
  benefitsmd: "benefits",

  types: "types",
  type: "types",
  tipos: "types",
  typesmd: "types",
  typesdata: "types",

  formats: "formats",
  format: "formats",
  formatos: "formats",
  soportes: "formats",
  formatsmd: "formats",
  formatsdata: "formats",
  "formatos-y-soportes": "formats",

  materials: "materials",
  material: "materials",
  materiales: "materials",
  materialsmd: "materials",
  materialsdata: "materials",

  finishes: "finishes",
  finish: "finishes",
  acabados: "finishes",
  finishesmd: "finishes",
  finishesdata: "finishes",

  applications: "applications",
  application: "applications",
  aplicaciones: "applications",
  uses: "applications",
  use: "applications",
  usos: "applications",
  usesmd: "applications",
  applicationsmd: "applications",
  applicationsdata: "applications",

  technical: "technical-specs",
  specs: "technical-specs",
  technicalspecs: "technical-specs",
  technicalspecsmd: "technical-specs",
  technicalspecsdata: "technical-specs",
  "technical-specs": "technical-specs",
  caracteristicas: "technical-specs",
  "caracteristicas-tecnicas": "technical-specs",
  especificaciones: "technical-specs",
  "especificaciones-tecnicas": "technical-specs",
};

export function normalizeSectionKey(value?: unknown): ContentSectionKey {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return SECTION_ALIASES[key] || key;
}

export function isCanonicalSectionKey(value?: unknown) {
  return CANONICAL_SECTION_KEYS.includes(value as typeof CANONICAL_SECTION_KEYS[number]);
}

export function resolveSectionKey(section?: Partial<SectionInput> | null) {
  const candidates = [section?.kind, section?.key, section?.id]
    .map((value) => normalizeSectionKey(value))
    .filter(Boolean);

  const canonical = candidates.find((candidate) => isCanonicalSectionKey(candidate));

  return canonical || candidates[0] || "";
}

export function eyebrowForCards(key?: string) {
  const value = normalizeSectionKey(key);

  if (value === "formats") return "Formatos y soportes";
  if (value === "finishes") return "Opciones de acabado";
  if (value === "applications") return "Aplicaciones";
  if (value === "materials") return "Materiales";
  if (value === "benefits") return "Beneficios";
  if (value === "technical-specs") return "Ficha técnica";

  return "";
}

export function variantForCards(key?: string): ContentCardVariant {
  return normalizeSectionKey(key) === "technical-specs" ? "feature" : "default";
}