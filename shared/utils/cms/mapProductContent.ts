import type { CmsFaqItem, ParsedBodyMdSection } from "./content.types";
import { mapParsedSectionsToBlocks } from "./mapSectionBlocks";

function firstNonEmpty(obj: any, keys: string[], fallback: any = "") {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
}

function sanitizeFaqsJson(input: unknown) {
  return String(input ?? "")
    .trim()
    .replace(/^Preguntas frecuentes\s*/i, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function parseFaqs(value: unknown): CmsFaqItem[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        q: String(item?.q ?? item?.question ?? "").trim(),
        a: String(item?.a ?? item?.answer ?? "").trim(),
      }))
      .filter((item) => item.q && item.a);
  }

  const raw = sanitizeFaqsJson(value);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        q: String(item?.q ?? item?.question ?? "").trim(),
        a: String(item?.a ?? item?.answer ?? "").trim(),
      }))
      .filter((item) => item.q && item.a);
  } catch {
    return [];
  }
}

function pushBodySection(
  target: ParsedBodyMdSection[],
  options: {
    id: string;
    key:
      | "detalles"
      | "beneficios"
      | "aplicaciones"
      | "caracteristicas-tecnicas"
      | "formatos-y-soportes"
      | "acabados"
      | "usos-habituales"
      | "otros";
    title: string;
    body: unknown;
  }
) {
  const body = String(options.body ?? "").trim();
  if (!body) return;

  target.push({
    id: options.id,
    key: options.key,
    title: options.title,
    body,
    step: target.length + 1,
  });
}

export function mapProductContent(product: any) {
  const rawBodyMd = String(
    firstNonEmpty(product, ["BodyMd", "bodyMd", "body", "markdown"], "")
  ).trim();

  const parsedEditorialSections: ParsedBodyMdSection[] = [];

  pushBodySection(parsedEditorialSections, {
    id: "details",
    key: "detalles",
    title: "Detalles",
    body: firstNonEmpty(product, [
      "DetailsMd",
      "detailsMd",
      "Details",
      "details",
      "ShortDescription",
      "shortDescription",
    ], ""),
  });

  pushBodySection(parsedEditorialSections, {
    id: "benefits",
    key: "beneficios",
    title: "Beneficios",
    body: firstNonEmpty(product, [
      "BenefitsMd",
      "benefitsMd",
      "Benefits",
      "benefits",
    ], ""),
  });

  pushBodySection(parsedEditorialSections, {
    id: "materials",
    key: "otros",
    title: "Materiales",
    body: firstNonEmpty(product, [
      "MaterialsMd",
      "materialsMd",
      "Materials",
      "materials",
    ], ""),
  });

  pushBodySection(parsedEditorialSections, {
    id: "formats-supports",
    key: "formatos-y-soportes",
    title: "Formatos y soportes",
    body: firstNonEmpty(product, [
      "FormatsMd",
      "formatsMd",
      "Formats",
      "formats",
    ], ""),
  });

  pushBodySection(parsedEditorialSections, {
    id: "finishes",
    key: "acabados",
    title: "Acabados",
    body: firstNonEmpty(product, [
      "FinishesMd",
      "finishesMd",
      "Finishes",
      "finishes",
    ], ""),
  });

  pushBodySection(parsedEditorialSections, {
    id: "technical-details",
    key: "caracteristicas-tecnicas",
    title: "Características técnicas",
    body: firstNonEmpty(product, [
      "TechnicalSpecsMd",
      "technicalSpecsMd",
      "TechnicalSpecs",
      "technicalSpecs",
    ], ""),
  });

  pushBodySection(parsedEditorialSections, {
    id: "applications",
    key: "aplicaciones",
    title: "Aplicaciones",
    body: firstNonEmpty(product, [
      "ApplicationsMd",
      "applicationsMd",
      "Applications",
      "applications",
    ], ""),
  });

  // Fallback legacy: solo si todavía no hay contenido editorial en columnas específicas.
  if (!parsedEditorialSections.length && rawBodyMd) {
    pushBodySection(parsedEditorialSections, {
      id: "details",
      key: "detalles",
      title: "Detalles",
      body: rawBodyMd,
    });
  }

  const sections = mapParsedSectionsToBlocks(parsedEditorialSections);

  const faqs = parseFaqs(
    firstNonEmpty(product, ["FaqsJson", "faqsJson", "faqs"], "")
  );

  return {
    bodyMd: rawBodyMd,
    sections,
    faqs,
  };
}
