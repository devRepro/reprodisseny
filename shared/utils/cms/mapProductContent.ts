import type { CmsFaqItem } from "./content.types";
import { parseBodyMdSections } from "./parseBodyMdSections";
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

export function mapProductContent(product: any) {
  const rawBodyMd = String(
    firstNonEmpty(product, ["BodyMd", "bodyMd", "body", "markdown"], "")
  ).trim();

  const fallbackBody = String(
    firstNonEmpty(product, ["description", "Description", "shortDescription", "ShortDescription"], "")
  ).trim();

  const contentSource = rawBodyMd || fallbackBody;

  const parsedSections = parseBodyMdSections(contentSource);
  const sections = mapParsedSectionsToBlocks(parsedSections);

  const faqs = parseFaqs(
    firstNonEmpty(product, ["FaqsJson", "faqsJson", "faqs"], "")
  );

  return {
    bodyMd: rawBodyMd,
    sections,
    faqs,
  };
}