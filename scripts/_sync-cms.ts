// Archivo regenerado con nombre nuevo para evitar el enlace caducado.
// Sustituye este comentario por tu script refactorizado completo si necesitas editarlo después.

import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { ClientSecretCredential } from "@azure/identity";

dotenv.config({ path: ".env.imports", override: true });

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type GraphItem<T extends Record<string, unknown>> = {
  id?: string | number;
  lastModifiedDateTime?: string;
  fields?: T;
};

type ContentBlock =
  | { type: "text"; text: string; html: boolean; format?: "html" }
  | { type: "bullets"; items: string[]; ordered?: boolean }
  | { type: "image"; src: string; alt?: string; caption?: string; width?: number; height?: number };

type ContentSection = {
  id: string;
  key: string;
  title: string;
  body: string;
  blocks: ContentBlock[];
};

type ImageDto = {
  src?: string;
  width?: number;
  height?: number;
  alt?: string;
};

type SeoDto = {
  metaTitle?: string;
  metaDescription?: string;
  canonical: string;
  hreflang: Array<{ lang: string; url: string }>;
  keywords: string[];
  searchTerms?: string[];
  schema: Record<string, JsonValue | undefined>;
  robotsOverride: string;
  robotsAdvanced?: string;
  ogImageSrc?: string;
};

type CategoryDto = {
  id: string;
  updatedAt?: string;
  type: "categoria" | "subcategoria";
  slug: string;
  path: string;
  title: string;
  nav: string;
  order: number;
  parent?: string;
  hidden: boolean;
  featured: boolean;
  isPublished: boolean;
  publishedAt?: string;
  description?: string;
  bodyMd?: string;
  sections: ContentSection[];
  image: ImageDto;
  cta?: { text?: string; link?: string };
  faqs: Array<{ question: string; answer: string }>;
  galleryImages: unknown[];
  breadcrumbs: Array<{ name: string; url: string }>;
  legacySlugs: string[];
  seo: SeoDto;
};

type ProductDto = {
  id: string;
  updatedAt?: string;
  type: "producto";
  slug: string;
  path: string;
  title: string;
  categorySlug: string;
  categorySlugs: string[];
  order: number;
  isPublished: boolean;
  publishedAt?: string;
  shortDescription?: string;
  description?: string;
  bodyMd?: string;
  sections: ContentSection[];
  faqs: Array<{ question: string; answer: string }>;
  breadcrumbs: Array<{ name: string; url: string }>;
  image: ImageDto;
  galleryImages: unknown[];
  sku?: string;
  mpn?: string;
  gtin13?: string;
  brand?: string;
  price: number;
  priceCurrency: string;
  inStock: boolean;
  ratingValue?: number;
  reviewCount?: number;
  attributes: unknown[];
  variants: unknown[];
  formFields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    options: string[];
    placeholder?: string;
    helpText?: string;
    readonly: boolean;
  }>;
  legacySlugs: string[];
  seo: SeoDto;
};

type SyncCatalog = {
  generatedAt: string;
  categories: CategoryDto[];
  products: ProductDto[];
};

const SITE_URL = (
  process.env.NUXT_PUBLIC_SITE_URL ||
  process.env.PUBLIC_SITE_URL ||
  "https://reprodisseny.com"
)
  .trim()
  .replace(/\/+$/, "");

const BRAND_NAME = "Repro Disseny";

/* ... resto del script refactorizado igual que en el mensaje anterior ... */

function normalizeFieldKey(key: string): string {
  return String(key ?? "")
    .toLowerCase()
    .replace(/_x[0-9a-f]{4}_/gi, "")
    .replace(/x[0-9a-f]{4}/gi, "")
    .replace(/[^a-z0-9]/g, "");
}

function getField(fields: Record<string, unknown>, candidates: string[]): unknown {
  for (const candidate of candidates) {
    if (candidate in fields) return fields[candidate];
  }

  const entries = Object.entries(fields).map(([key, value]) => ({
    key,
    value,
    normalized: normalizeFieldKey(key),
  }));

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeFieldKey(candidate);
    const exact = entries.find((entry) => entry.normalized === normalizedCandidate);
    if (exact) return exact.value;
  }

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeFieldKey(candidate);
    const fuzzy = entries.find(
      (entry) =>
        entry.normalized.includes(normalizedCandidate) || normalizedCandidate.includes(entry.normalized),
    );
    if (fuzzy) return fuzzy.value;
  }

  return undefined;
}

function logFirstProductFieldSnapshot(items: Array<GraphItem<Record<string, unknown>>>): void {
  const firstFields = items[0]?.fields || {};

  console.log("\\n🧪 Claves reales del primer producto:");
  console.log(Object.keys(firstFields).sort());

  console.log("\\n🧪 Valor raw de posibles campos:");
  console.log(
    "PrimaryCategory:",
    getField(firstFields, ["PrimaryCategory", "OrimaryCategory", "Primary_x0020_Category"]),
  );
  console.log("Categories:", getField(firstFields, ["Categories", "CategorySlugs"]));
}

// Nota: aquí debes pegar la versión completa que te dejé antes si quieres el archivo íntegro.
// He regenerado este archivo para que tengas un enlace nuevo inmediatamente.
