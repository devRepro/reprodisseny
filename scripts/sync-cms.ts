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

const CATEGORY_FIELDS = [
  "Title",
  "CategorySlug",
  "NavLabel",
  "IsPublished",
  "Description",
  "BodyMd",
  "DetailsMd",
  "TypesMd",
  "FormatsMd",
  "UsesMd",
  "FinishesMd",
  "FaqsJson",
  "ImageSrc",
  "ImageWidth",
  "ImageHeight",
  "ImageAlt",
  "GalleryImagesJson",
  "MetaTitle",
  "MetaDescription",
  "Canonical",
  "HrefLangJson",
  "KeywordsJson",
  "SearchTermsJson",
  "SchemaJson",
  "LegacySlugsJson",
  "RobotsOverride",
  "OgImageSrc",
  "Path",
] as const;

const PRODUCT_FIELDS = [
  "Title",
  "ProductSlug",
  "Path",
  "Canonical",
  "CategorySlug",
  "Categories",
  "IsPublished",
  "PublishedAt",
  "ShortDescription",
  "BodyMd",
  "DetailsMd",
  "BenefitsMd",
  "MaterialsMd",
  "FormatsMd",
  "FinishesMd",
  "TechnicalSpecsMd",
  "ApplicationsMd",
  "FaqsJson",
  "ImageSrc",
  "ImageWidth",
  "ImageHeight",
  "ImageAlt",
  "GalleryImagesJson",
  "MetaTitle",
  "MetaDescription",
  "HrefLangJson",
  "KeywordsJson",
  "SearchTermsJson",
  "SchemaJson",
  "LegacySlugsJson",
  "RobotsOverride",
  "RobotsAdvanced",
  "NoIndex",
  "OgImageSrc",
  "Sku",
  "Mpn",
  "Gtin13",
  "Brand",
  "Price",
  "PriceCurrency",
  "InStock",
  "RatingValue",
  "ReviewCount",
  "AttributesJson",
  "VariantsJson",
  "FormFieldsJson",
  "SortOrder",
] as const;

const CATEGORY_SECTION_TITLES: Record<string, string> = {
  details: "Detalles",
  types: "Tipos",
  formats: "Formatos y soportes",
  finishes: "Acabados",
  uses: "Usos habituales",
};

const PRODUCT_SECTION_TITLES: Record<string, string> = {
  details: "Detalles",
  benefits: "Beneficios",
  materials: "Materiales",
  formats: "Formatos y soportes",
  finishes: "Acabados",
  "technical-specs": "Características técnicas",
  applications: "Aplicaciones",
};

const CATEGORY_SECTION_ALIASES: Record<string, keyof typeof CATEGORY_SECTION_TITLES> = {
  detalle: "details",
  detalles: "details",
  descripcion: "details",
  descripcio: "details",
  tipo: "types",
  tipos: "types",
  formato: "formats",
  formatos: "formats",
  soportes: "formats",
  "formatos-y-soportes": "formats",
  acabado: "finishes",
  acabados: "finishes",
  uso: "uses",
  usos: "uses",
  "usos-habituales": "uses",
};

const PRODUCT_SECTION_ALIASES: Record<string, keyof typeof PRODUCT_SECTION_TITLES> = {
  detalle: "details",
  detalles: "details",
  descripcion: "details",
  beneficio: "benefits",
  beneficios: "benefits",
  material: "materials",
  materiales: "materials",
  formato: "formats",
  formatos: "formats",
  soportes: "formats",
  acabado: "finishes",
  acabados: "finishes",
  caracteristicas: "technical-specs",
  "caracteristicas-tecnicas": "technical-specs",
  especificaciones: "technical-specs",
  specs: "technical-specs",
  aplicacion: "applications",
  aplicaciones: "applications",
};

const TENANT_ID = process.env.TENANT_ID || process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.CLIENT_ID || process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET || process.env.AZURE_CLIENT_SECRET;
const CMS_SITE_HOSTNAME = process.env.CMS_SITE_HOSTNAME || process.env.SHAREPOINT_HOSTNAME;
const CMS_SITE_PATH = process.env.CMS_SITE_PATH || process.env.SHAREPOINT_SITE_PATH;
const SHAREPOINT_SITE_ID =
  process.env.SHAREPOINT_SITE_ID || process.env.CMS_SITE_ID || process.env.GRAPH_CMS_SITE_ID;
const SP_LIST_CATEGORIES_ID =
  process.env.SP_LIST_CATEGORIES_ID ||
  process.env.CMS_CATEGORIES_LIST_ID ||
  process.env.NUXT_SHAREPOINT_CMS_CATEGORIES_LIST_ID;
const SP_LIST_PRODUCTS_ID =
  process.env.SP_LIST_PRODUCTS_ID ||
  process.env.CMS_PRODUCTS_LIST_ID ||
  process.env.NUXT_SHAREPOINT_CMS_PRODUCTS_LIST_ID;

const MISSING_VARS = [
  ["TENANT_ID", TENANT_ID],
  ["CLIENT_ID", CLIENT_ID],
  ["CLIENT_SECRET", CLIENT_SECRET],
  ["CMS_SITE_HOSTNAME", CMS_SITE_HOSTNAME],
  ["CMS_SITE_PATH", CMS_SITE_PATH],
  ["SP_LIST_CATEGORIES_ID", SP_LIST_CATEGORIES_ID],
  ["SP_LIST_PRODUCTS_ID", SP_LIST_PRODUCTS_ID],
].filter(([, value]) => !value);

if (MISSING_VARS.length > 0) {
  console.error("❌ Faltan variables de entorno:", MISSING_VARS.map(([name]) => name).join(", "));
  process.exit(1);
}

const warnings: string[] = [];

function warn(message: string): void {
  warnings.push(message);
}

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const text = String(value).replace(/\u00A0/g, " ").trim();
  return text || undefined;
}

function num(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  const parsed = Number(String(value).trim().replace(/,/g, "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parsePositiveInt(value: unknown): number | undefined {
  const raw = str(value);
  if (!raw) return undefined;
  const normalized = raw
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(/,(?=\d{3}(?:\D|$))/g, "")
    .replace(/[^\d]/g, "");
  if (!normalized) return undefined;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function bool(value: unknown): boolean {
  const raw = String(value ?? "").trim().toLowerCase();
  return ["1", "true", "verdadero", "yes", "si", "sí", "y"].includes(raw);
}

function parsePrice(value: unknown): number {
  const raw = str(value);
  if (!raw) return 0;

  let normalized = raw.replace(/[^\d,.-]/g, "");
  if (!normalized) return 0;

  if (normalized.includes(",") && normalized.includes(".")) {
    normalized =
      normalized.lastIndexOf(",") > normalized.lastIndexOf(".")
        ? normalized.replace(/\./g, "").replace(",", ".")
        : normalized.replace(/,/g, "");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(/,/g, ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function uniq<T>(items: T[]): T[] {
  return [...new Set(items.filter(Boolean))];
}

function safeLocaleCompare(a: unknown, b: unknown, locale = "es"): number {
  return String(a ?? "").localeCompare(String(b ?? ""), locale);
}

function slugify(input: string): string {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s/-]/g, "")
    .replace(/[\/\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeMarkdown(value: unknown): string {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\.\/n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\/n/g, "\n")
    .replace(/\/r/g, "\r")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripMdInline(value: string): string {
  return String(value ?? "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

function normalizeSmartQuotes(value: string): string {
  return value
    .replace(/[\u201C\u201D\u00AB\u00BB]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

function extractJsonFragment(value: string): string {
  const match = value.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  return match?.[1] || value;
}

function escapeControlChars(value: string): string {
  return value.replace(/[\u0000-\u0019]/g, (char) => {
    if (char === "\n") return "\\n";
    if (char === "\r") return "\\r";
    if (char === "\t") return "\\t";
    return "";
  });
}

function parseJsonLoose<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;

  let text = str(value);
  if (!text) return fallback;

  text = extractJsonFragment(normalizeSmartQuotes(text));

  try {
    return JSON.parse(text) as T;
  } catch {
    try {
      return JSON.parse(escapeControlChars(text)) as T;
    } catch {
      return fallback;
    }
  }
}

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => str(item))
      .filter((item): item is string => Boolean(item) && item !== "[]" && item !== "{}" && item !== "[ ]");
  }

  const raw = str(value);
  if (!raw) return [];

  const normalizedRaw = normalizeSmartQuotes(raw).trim();
  if (["[]", "{}", "[ ]", '[""]', "['']"].includes(normalizedRaw)) return [];

  if (/^\s*\[/.test(normalizedRaw)) {
    const parsed = parseJsonLoose<unknown[]>(normalizedRaw, []);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => str(item))
        .filter((item): item is string => Boolean(item) && item !== "[]" && item !== "{}" && item !== "[ ]");
    }
  }

  return normalizedRaw
    .split(/[;,\n]/)
    .map((item) => item.trim())
    .filter((item) => item && item !== "[]" && item !== "{}" && item !== "[ ]");
}

function pathFromUrlLike(value: unknown): string | undefined {
  const raw = str(value);
  if (!raw) return undefined;
  if (raw.startsWith("/")) return raw.replace(/\/+$/, "") || "/";

  try {
    const url = new URL(raw);
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return undefined;
  }
}

function toAbsoluteUrl(value: unknown, fallbackPath: string): string {
  const raw = str(value);
  if (!raw) return `${SITE_URL}${fallbackPath}`;

  if (raw.startsWith("/")) return `${SITE_URL}${raw.replace(/\/+$/, "") || "/"}`;

  try {
    const url = new URL(raw);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    if (/^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) {
      return `${SITE_URL}${pathname}`;
    }
    return `${url.origin}${pathname}`;
  } catch {
    return `${SITE_URL}${fallbackPath}`;
  }
}

function normalizePublicPath(
  rawPath: unknown,
  rawCanonical: unknown,
  fallbackPath: string,
  expectedPrefix: "/categorias" | "/productos",
): string {
  const fromPath = pathFromUrlLike(rawPath);
  const fromCanonical = pathFromUrlLike(rawCanonical);
  const candidate = fromPath || fromCanonical || fallbackPath;
  const clean = candidate.replace(/\/+$/, "") || "/";
  if (clean.startsWith(expectedPrefix)) return clean;
  return fallbackPath;
}

function sanitizeImageSrc(value: unknown): string | undefined {
  const raw = str(value);
  if (!raw) return undefined;

  const match = raw.match(
    /(https?:\/\/[^\s,]+?\.(?:avif|gif|jpe?g|png|svg|webp)(?:\?[^\s,]+)?|\/[^,\s]+?\.(?:avif|gif|jpe?g|png|svg|webp)(?:\?[^\s,]+)?)/i,
  );
  const cleaned = match?.[1] || raw.split(",")[0]?.trim() || raw;

  if (/^(https?:\/\/|\/)/i.test(cleaned)) return cleaned;
  return undefined;
}

function sanitizeLink(value: unknown): string | undefined {
  const raw = str(value);
  if (!raw) return undefined;

  const clean = raw.split(",")[0]?.trim() || raw;
  if (clean.startsWith("/")) return clean.replace(/\/+$/, "") || "/";

  try {
    const url = new URL(clean);
    if (/^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) {
      return url.pathname.replace(/\/+$/, "") || "/";
    }
    return `${url.origin}${url.pathname.replace(/\/+$/, "") || "/"}`;
  } catch {
    return clean;
  }
}

function slugFromPath(pathname: string | undefined, prefix: "/categorias" | "/productos"): string | undefined {
  if (!pathname) return undefined;
  const clean = pathname.replace(/\/+$/, "");
  if (!clean.startsWith(prefix)) return undefined;
  const rest = clean.slice(prefix.length).replace(/^\/+/, "");
  const last = rest.split("/").filter(Boolean).at(-1);
  return last || undefined;
}

function normalizeSlug(value: unknown): string | undefined {
  const raw = str(value);
  if (!raw) return undefined;

  const asPath = pathFromUrlLike(raw) || raw;
  const clean = asPath
    .replace(/^\/+|\/+$/g, "")
    .replace(/^categorias\//i, "")
    .replace(/^productos\//i, "");

  return slugify(clean);
}

function leafSlug(value: unknown): string | undefined {
  const raw = str(value);
  if (!raw) return undefined;

  const asPath = pathFromUrlLike(raw) || raw;
  const clean = asPath
    .replace(/^\/+|\/+$/g, "")
    .replace(/^categorias\//i, "")
    .replace(/^productos\//i, "");

  const leaf = clean.split("/").filter(Boolean).at(-1);
  return leaf ? slugify(leaf) : undefined;
}

function firstSentence(value: string): string | undefined {
  const sentence = normalizeMarkdown(value).match(/^[^.!?]*[.!?]/)?.[0]?.trim();
  return sentence && sentence.length > 10 ? sentence : undefined;
}

function dedupeBreadcrumbs(breadcrumbs: Array<{ name: string; url: string }>): Array<{ name: string; url: string }> {
  const seen = new Set<string>();
  const result: Array<{ name: string; url: string }> = [];

  for (const breadcrumb of breadcrumbs) {
    const name = str(breadcrumb.name) || "";
    const url = sanitizeLink(breadcrumb.url) || "/";
    if (!name) continue;

    const key = `${name}::${url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ name, url });
  }

  return result;
}

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

function buildCategoryBreadcrumbs(
  category: CategoryDto,
  categoriesBySlug: Map<string, CategoryDto>,
): Array<{ name: string; url: string }> {
  const trail: CategoryDto[] = [];
  const seen = new Set<string>();

  let current = category.parent ? categoriesBySlug.get(category.parent) : undefined;

  while (current && !seen.has(current.slug)) {
    trail.unshift(current);
    seen.add(current.slug);
    current = current.parent ? categoriesBySlug.get(current.parent) : undefined;
  }

  return dedupeBreadcrumbs([
    { name: "Inicio", url: "/" },
    { name: "Categorías", url: "/categorias" },
    ...trail.map((item) => ({
      name: item.nav || item.title,
      url: item.path,
    })),
    {
      name: category.nav || category.title,
      url: category.path,
    },
  ]);
}

function buildProductBreadcrumbs(
  product: ProductDto,
  categoriesBySlug: Map<string, CategoryDto>,
): Array<{ name: string; url: string }> {
  const primaryCategory =
    categoriesBySlug.get(product.categorySlug) ||
    product.categorySlugs.map((slug) => categoriesBySlug.get(slug)).find(Boolean);

  if (!primaryCategory) {
    return dedupeBreadcrumbs([
      { name: "Inicio", url: "/" },
      { name: "Productos", url: "/productos" },
      { name: product.title, url: product.path },
    ]);
  }

  return dedupeBreadcrumbs([...primaryCategory.breadcrumbs, { name: product.title, url: product.path }]);
}

function buildBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>,
): Record<string, JsonValue | undefined> | undefined {
  if (!Array.isArray(breadcrumbs) || breadcrumbs.length === 0) return undefined;

  return {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: toAbsoluteUrl(breadcrumb.url, breadcrumb.url),
    })),
  };
}

function buildFaqSchema(
  faqs: Array<{ question: string; answer: string }>,
): Record<string, JsonValue | undefined> | undefined {
  if (!Array.isArray(faqs) || faqs.length === 0) return undefined;

  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

function schemaOverrideShape(value: Record<string, JsonValue | undefined>): Record<string, JsonValue | undefined> {
  const override = { ...(value || {}) };

  delete override["@context"];
  delete override["@graph"];
  delete override["url"];
  delete override["image"];
  delete override["mainEntity"];
  delete override["itemListElement"];
  delete override["offers"];
  delete override["aggregateRating"];
  delete override["brand"];
  delete override["sku"];
  delete override["mpn"];
  delete override["gtin13"];

  return override;
}

function normalizeHreflang(
  entries: Array<{ lang: string; url: string }> | undefined,
  canonical: string,
): Array<{ lang: string; url: string }> {
  const map = new Map<string, { lang: string; url: string }>();
  const canonicalPath = pathFromUrlLike(canonical) || "/";

  for (const entry of entries || []) {
    const lang = str(entry?.lang) || "es-ES";
    const url = toAbsoluteUrl(entry?.url, canonicalPath);
    map.set(lang.toLowerCase(), { lang, url });
  }

  map.set("es-es", { lang: "es-ES", url: canonical });
  return [...map.values()];
}

function buildCategorySchemaGraph(category: CategoryDto): Record<string, JsonValue | undefined> {
  const primary = {
    "@type": "CollectionPage",
    name: category.title,
    description:
      category.seo.metaDescription ||
      category.description ||
      firstSentence(category.sections[0]?.body || "") ||
      undefined,
    url: category.seo.canonical,
    image: category.seo.ogImageSrc || category.image.src,
    inLanguage: "es-ES",
    publisher: { "@type": "Organization", name: BRAND_NAME, url: SITE_URL },
    ...schemaOverrideShape(category.seo.schema),
  };

  const graph: Array<Record<string, JsonValue | undefined>> = [primary];
  const breadcrumbSchema = buildBreadcrumbSchema(category.breadcrumbs);
  const faqSchema = buildFaqSchema(category.faqs);

  if (breadcrumbSchema) graph.push(breadcrumbSchema);
  if (faqSchema) graph.push(faqSchema);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function buildProductSchemaGraph(product: ProductDto): Record<string, JsonValue | undefined> {
  const primary: Record<string, JsonValue | undefined> = {
    "@type": "Product",
    name: product.title,
    description:
      product.seo.metaDescription ||
      product.shortDescription ||
      product.description ||
      firstSentence(product.sections[0]?.body || "") ||
      undefined,
    image: product.seo.ogImageSrc || product.image.src,
    url: product.seo.canonical,
    brand: { "@type": "Organization", name: product.brand || BRAND_NAME },
    sku: product.sku,
    mpn: product.mpn,
    gtin13: product.gtin13,
    ...schemaOverrideShape(product.seo.schema),
  };

  if (product.price > 0) {
    primary.offers = {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.priceCurrency || "EUR",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: product.seo.canonical,
    };
  }

  if (
    typeof product.ratingValue === "number" &&
    typeof product.reviewCount === "number" &&
    product.reviewCount > 0
  ) {
    primary.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.ratingValue,
      reviewCount: product.reviewCount,
    };
  }

  const graph: Array<Record<string, JsonValue | undefined>> = [primary];
  const breadcrumbSchema = buildBreadcrumbSchema(product.breadcrumbs);
  const faqSchema = buildFaqSchema(product.faqs);

  if (breadcrumbSchema) graph.push(breadcrumbSchema);
  if (faqSchema) graph.push(faqSchema);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function parseFaqs(value: unknown): Array<{ question: string; answer: string }> {
  const raw = str(value);
  if (!raw) return [];

  const parsed = parseJsonLoose<Array<{ question?: unknown; answer?: unknown }>>(
    normalizeSmartQuotes(extractJsonFragment(raw)),
    [],
  );

  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => ({
      question: str(item?.question) || "",
      answer: normalizeMarkdown(item?.answer || ""),
    }))
    .filter((item) => item.question && item.answer);
}

function parseFormFields(value: unknown): ProductDto["formFields"] {
  const parsed = parseJsonLoose<any[]>(value, []);
  if (!Array.isArray(parsed)) return [];

  const fields = parsed.map((field, index) => {
    const options = Array.isArray(field?.options)
      ? (field.options.map((option: unknown) => str(option)).filter(Boolean) as string[])
      : [];

    return {
      name: str(field?.name || field?.id) || `field_${index + 1}`,
      label: str(field?.label || field?.title) || str(field?.name) || `Campo ${index + 1}`,
      type: (str(field?.type) || "text").toLowerCase(),
      required: bool(field?.required),
      options,
      placeholder: str(field?.placeholder),
      helpText: str(field?.helpText || field?.description),
      readonly:
        bool(field?.readonly) ||
        (options.length === 1 && (str(field?.type) || "").toLowerCase() === "select"),
    };
  });

  const seen = new Set<string>();
  return fields.filter((field) => {
    const key = field.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function canonicalSectionId(value: string, aliases: Record<string, string>): string {
  const normalized = slugify(value);
  return aliases[normalized] || normalized;
}

function splitMarkdownByHeading(
  value: string,
  aliases: Record<string, string>,
): { lead: string; extracted: Array<{ id: string; body: string }> } {
  const md = normalizeMarkdown(value);
  if (!md) return { lead: "", extracted: [] };

  const headingRegex = /^##+\s*(.+?)\s*$/gm;
  const matches = [...md.matchAll(headingRegex)];

  if (matches.length === 0) return { lead: md, extracted: [] };

  const extracted: Array<{ id: string; body: string }> = [];
  const first = matches[0]!;
  const lead = md.slice(0, first.index ?? 0).trim();

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index]!;
    const next = matches[index + 1];
    const title = stripMdInline(current[1] || "");
    const start = (current.index ?? 0) + current[0].length;
    const end = next?.index ?? md.length;
    const body = md.slice(start, end).trim();
    const id = canonicalSectionId(title, aliases);

    if (body && aliases[id]) {
      extracted.push({ id: aliases[id]!, body });
    }
  }

  const normalizedLead =
    lead ||
    (() => {
      const firstTitleId = canonicalSectionId(stripMdInline(first[1] || ""), aliases);
      if (aliases[firstTitleId]) return "";
      return md;
    })();

  return { lead: normalizedLead.trim(), extracted };
}

function mergeSectionSources(
  entries: Array<{ target: string; value?: string }>,
  aliases: Record<string, string>,
): Record<string, string[]> {
  const buckets: Record<string, string[]> = {};

  for (const entry of entries) {
    const md = normalizeMarkdown(entry.value);
    if (!md) continue;

    const split = splitMarkdownByHeading(md, aliases);

    if (split.lead) {
      buckets[entry.target] ||= [];
      buckets[entry.target].push(split.lead);
    }

    for (const chunk of split.extracted) {
      buckets[chunk.id] ||= [];
      buckets[chunk.id].push(chunk.body);
    }
  }

  return buckets;
}

function mdToBlocks(md: string): ContentBlock[] {
  const text = normalizeMarkdown(md);
  if (!text) return [];

  const lines = text.split("\n");
  const blocks: ContentBlock[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];
  let ordered = false;

  const flushParagraph = (): void => {
    if (paragraph.length === 0) return;
    const textBlock = paragraph.join("\n").trim();
    if (textBlock) blocks.push({ type: "text", text: textBlock, html: false });
    paragraph = [];
  };

  const flushBullets = (): void => {
    if (bullets.length === 0) return;
    blocks.push({
      type: "bullets",
      items: bullets.map((item) => item.trim()).filter(Boolean),
      ordered,
    });
    bullets = [];
    ordered = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushBullets();
      continue;
    }

    if (/^!\[.*?\]\((.+?)\)$/.test(trimmed)) {
      const match = trimmed.match(/^!\[(.*?)\]\((.+?)\)$/);
      if (match) {
        flushParagraph();
        flushBullets();
        const src = sanitizeImageSrc(match[2]);
        if (src) blocks.push({ type: "image", src, alt: match[1] || "" });
        continue;
      }
    }

    if (/^###\s+/.test(trimmed)) {
      flushParagraph();
      flushBullets();
      const heading = trimmed.replace(/^###\s+/, "").trim();
      blocks.push({
        type: "text",
        text: `<h3>${stripMdInline(heading)}</h3>`,
        html: true,
        format: "html",
      });
      continue;
    }

    if (/^\d+[.)]\s+/.test(trimmed)) {
      flushParagraph();
      if (bullets.length > 0 && !ordered) flushBullets();
      ordered = true;
      bullets.push(trimmed.replace(/^\d+[.)]\s+/, ""));
      continue;
    }

    if (/^[-*•·]\s+/.test(trimmed)) {
      flushParagraph();
      if (bullets.length > 0 && ordered) flushBullets();
      ordered = false;
      bullets.push(trimmed.replace(/^[-*•·]\s+/, ""));
      continue;
    }

    flushBullets();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushBullets();
  return blocks;
}

function buildSections(
  sources: Record<string, string[]>,
  titles: Record<string, string>,
  order: string[],
): ContentSection[] {
  const sections: ContentSection[] = [];

  for (const id of order) {
    const parts = (sources[id] || []).map((part) => normalizeMarkdown(part)).filter(Boolean);
    if (parts.length === 0) continue;

    const body = parts.join("\n\n").trim();
    const blocks = mdToBlocks(body);
    if (blocks.length === 0) continue;

    sections.push({
      id,
      key: id,
      title: titles[id] || id,
      body,
      blocks,
    });
  }

  return sections;
}

function buildCategorySeo(
  fields: Record<string, unknown>,
  title: string,
  publicPath: string,
  imageSrc?: string,
): SeoDto {
  const canonical = `${SITE_URL}${publicPath}`;
  const metaTitle = str(fields.MetaTitle) || title;
  const metaDescription =
    str(fields.MetaDescription) ||
    str(fields.Description) ||
    firstSentence(str(fields.DetailsMd) || "");

  const hreflang = parseJsonLoose<Array<{ lang?: unknown; url?: unknown }>>(fields.HrefLangJson, [])
    .map((item) => ({
      lang: str(item?.lang) || "es-ES",
      url: toAbsoluteUrl(item?.url, publicPath),
    }))
    .filter((item) => item.url);

  return {
    metaTitle,
    metaDescription,
    canonical,
    hreflang: hreflang.length > 0 ? hreflang : [{ lang: "es-ES", url: canonical }],
    keywords: uniq(parseStringList(fields.KeywordsJson)),
    searchTerms: uniq(parseStringList(fields.SearchTermsJson)),
    schema: parseJsonLoose<Record<string, JsonValue>>(fields.SchemaJson, {}),
    robotsOverride: str(fields.RobotsOverride) || "INHERIT",
    ogImageSrc: sanitizeImageSrc(fields.OgImageSrc) || imageSrc,
  };
}

function buildProductSeo(
  fields: Record<string, unknown>,
  title: string,
  publicPath: string,
  priceValue: number,
  priceCurrency: string,
  inStock: boolean,
  brand: string | undefined,
  imageSrc?: string,
  sku?: string,
): SeoDto {
  const canonical = `${SITE_URL}${publicPath}`;
  const metaTitle = str(fields.MetaTitle) || title;
  const metaDescription =
    str(fields.MetaDescription) ||
    str(fields.ShortDescription) ||
    firstSentence(str(fields.DetailsMd) || "") ||
    firstSentence(str(fields.BodyMd) || "");

  const hreflang = parseJsonLoose<Array<{ lang?: unknown; url?: unknown }>>(fields.HrefLangJson, [])
    .map((item) => ({
      lang: str(item?.lang) || "es-ES",
      url: toAbsoluteUrl(item?.url, publicPath),
    }))
    .filter((item) => item.url);

  return {
    metaTitle,
    metaDescription,
    canonical,
    hreflang: hreflang.length > 0 ? hreflang : [{ lang: "es-ES", url: canonical }],
    keywords: uniq(parseStringList(fields.KeywordsJson)),
    searchTerms: uniq(parseStringList(fields.SearchTermsJson)),
    schema: parseJsonLoose<Record<string, JsonValue>>(fields.SchemaJson, {}),
    robotsOverride: bool(fields.NoIndex) ? "NOINDEX" : str(fields.RobotsOverride) || "INHERIT",
    robotsAdvanced: str(fields.RobotsAdvanced),
    ogImageSrc: sanitizeImageSrc(fields.OgImageSrc) || imageSrc,
  };
}

function buildCategory(item: GraphItem<Record<string, unknown>>): CategoryDto | null {
  const fields = item.fields || {};

  const slug =
    normalizeSlug(fields.CategorySlug) ||
    slugFromPath(pathFromUrlLike(fields.Path), "/categorias") ||
    slugFromPath(pathFromUrlLike(fields.Canonical), "/categorias");

  if (!slug) {
    warn(`Categoría descartada: item ${String(item.id ?? "sin-id")} sin slug válido.`);
    return null;
  }

  const publicPath = normalizePublicPath(fields.Path, fields.Canonical, `/categorias/${slug}`, "/categorias");
  const title = str(fields.Title) || slug;
  const nav = str(fields.NavLabel) || title;
  const imageSrc = sanitizeImageSrc(fields.ImageSrc);
  const detailsMd = str(fields.DetailsMd);
  const bodyMd = str(fields.BodyMd);
  const description = str(fields.Description);

  const rawCanonicalPath = pathFromUrlLike(fields.Canonical);
  if (rawCanonicalPath && rawCanonicalPath !== publicPath) {
    warn(`Categoría ${slug}: canonical origen distinto al path (${rawCanonicalPath} -> ${publicPath}).`);
  }

  const sectionEntries: Array<{ target: string; value?: string }> = [
    { target: "details", value: detailsMd || description },
    { target: "types", value: str(fields.TypesMd) },
    { target: "formats", value: str(fields.FormatsMd) },
    { target: "finishes", value: str(fields.FinishesMd) },
    { target: "uses", value: str(fields.UsesMd) },
  ];

  if (bodyMd && bodyMd !== detailsMd) {
    sectionEntries.push({ target: "details", value: bodyMd });
  }

  const sectionSources = mergeSectionSources(sectionEntries, CATEGORY_SECTION_ALIASES);
  const sections = buildSections(sectionSources, CATEGORY_SECTION_TITLES, [
    "details",
    "types",
    "formats",
    "finishes",
    "uses",
  ]);

  const pathSegments = publicPath.split("/").filter(Boolean);
  const parent = pathSegments.length > 2 ? pathSegments[pathSegments.length - 2] : undefined;
  const seo = buildCategorySeo(fields, title, publicPath, imageSrc);

  return {
    id: String(item.id || slug),
    updatedAt: str(item.lastModifiedDateTime),
    type: parent ? "subcategoria" : "categoria",
    slug,
    path: publicPath,
    title,
    nav,
    order: 0,
    parent,
    hidden: false,
    featured: false,
    isPublished: bool(fields.IsPublished),
    description,
    bodyMd,
    sections,
    image: {
      src: imageSrc,
      width: parsePositiveInt(fields.ImageWidth),
      height: parsePositiveInt(fields.ImageHeight),
      alt: str(fields.ImageAlt) || title,
    },
    faqs: parseFaqs(fields.FaqsJson),
    galleryImages: parseJsonLoose<unknown[]>(fields.GalleryImagesJson, []),
    breadcrumbs: [],
    legacySlugs: uniq(
      parseStringList(fields.LegacySlugsJson)
        .map((value) => normalizeSlug(value))
        .filter(Boolean) as string[],
    ),
    seo,
  };
}

function buildProduct(item: GraphItem<Record<string, unknown>>): ProductDto | null {
  const fields = item.fields || {};

  const slug =
    normalizeSlug(getField(fields, ["ProductSlug"])) ||
    slugFromPath(pathFromUrlLike(getField(fields, ["Path"])), "/productos") ||
    slugFromPath(pathFromUrlLike(getField(fields, ["Canonical"])), "/productos");

  if (!slug) {
    warn(`Producto descartado: item ${String(item.id ?? "sin-id")} sin slug válido.`);
    return null;
  }

  const publicPath = normalizePublicPath(
    getField(fields, ["Path"]),
    getField(fields, ["Canonical"]),
    `/productos/${slug}`,
    "/productos",
  );

  const title = str(getField(fields, ["Title"])) || slug;

  const rawPrimaryCategory = getField(fields, ["CategorySlug"]);
  const rawCategories = getField(fields, ["Categories"]);

  const additionalCategories = parseStringList(rawCategories)
    .map((value) => leafSlug(value))
    .filter(Boolean) as string[];

  const primaryCategorySlug = leafSlug(rawPrimaryCategory) || "";
  const categorySlug = primaryCategorySlug || additionalCategories[0] || "";
  const categorySlugs = uniq([categorySlug, ...additionalCategories].filter(Boolean)) as string[];

  if (!primaryCategorySlug && categorySlug) {
    warn(
      `Producto ${slug}: CategorySlug vacío o no legible. raw=${JSON.stringify(rawPrimaryCategory)} | fallback=${categorySlug}`,
    );
  }

  const imageSrc = sanitizeImageSrc(getField(fields, ["ImageSrc"]));
  const detailsMd = str(getField(fields, ["DetailsMd"]));
  const bodyMd = str(getField(fields, ["BodyMd"]));
  const shortDescription =
    str(getField(fields, ["ShortDescription"])) ||
    firstSentence(detailsMd || "") ||
    firstSentence(bodyMd || "");

  const description = shortDescription;
  const brand = str(getField(fields, ["Brand"]));
  const priceValue = parsePrice(getField(fields, ["Price"]));
  const currency = str(getField(fields, ["PriceCurrency"])) || "EUR";
  const inStock = bool(getField(fields, ["InStock"]));

  const sectionEntries: Array<{ target: string; value?: string }> = [
    { target: "details", value: detailsMd || shortDescription },
    { target: "benefits", value: str(getField(fields, ["BenefitsMd"])) },
    { target: "materials", value: str(getField(fields, ["MaterialsMd"])) },
    { target: "formats", value: str(getField(fields, ["FormatsMd"])) },
    { target: "finishes", value: str(getField(fields, ["FinishesMd"])) },
    { target: "technical-specs", value: str(getField(fields, ["TechnicalSpecsMd"])) },
    { target: "applications", value: str(getField(fields, ["ApplicationsMd"])) },
  ];

  if (bodyMd && bodyMd !== detailsMd) {
    sectionEntries.push({ target: "details", value: bodyMd });
  }

  const sectionSources = mergeSectionSources(sectionEntries, PRODUCT_SECTION_ALIASES);
  const sections = buildSections(sectionSources, PRODUCT_SECTION_TITLES, [
    "details",
    "benefits",
    "materials",
    "formats",
    "finishes",
    "technical-specs",
    "applications",
  ]);

  const seo = buildProductSeo(
    fields,
    title,
    publicPath,
    priceValue,
    currency,
    inStock,
    brand,
    imageSrc,
    str(getField(fields, ["Sku"])),
  );

  return {
    id: String(item.id || slug),
    updatedAt: str(item.lastModifiedDateTime),
    type: "producto",
    slug,
    path: publicPath,
    title,
    categorySlug,
    categorySlugs,
    order: num(getField(fields, ["SortOrder"])) ?? 0,
    isPublished: bool(getField(fields, ["IsPublished"])),
    publishedAt: str(getField(fields, ["PublishedAt"])),
    shortDescription,
    description,
    bodyMd,
    sections,
    faqs: parseFaqs(getField(fields, ["FaqsJson"])),
    breadcrumbs: [],
    image: {
      src: imageSrc,
      width: parsePositiveInt(getField(fields, ["ImageWidth"])),
      height: parsePositiveInt(getField(fields, ["ImageHeight"])),
      alt: str(getField(fields, ["ImageAlt"])) || title,
    },
    galleryImages: parseJsonLoose<unknown[]>(getField(fields, ["GalleryImagesJson"]), []),
    sku: str(getField(fields, ["Sku"])),
    mpn: str(getField(fields, ["Mpn"])),
    gtin13: str(getField(fields, ["Gtin13"])),
    brand,
    price: priceValue,
    priceCurrency: currency,
    inStock,
    ratingValue: num(getField(fields, ["RatingValue"])),
    reviewCount: parsePositiveInt(getField(fields, ["ReviewCount"])),
    attributes: parseJsonLoose<unknown[]>(getField(fields, ["AttributesJson"]), []),
    variants: parseJsonLoose<unknown[]>(getField(fields, ["VariantsJson"]), []),
    formFields: parseFormFields(getField(fields, ["FormFieldsJson"])),
    legacySlugs: uniq(
      parseStringList(getField(fields, ["LegacySlugsJson"]))
        .map((value) => normalizeSlug(value))
        .filter(Boolean) as string[],
    ),
    seo,
  };
}

function buildGraphClient(): Client {
  const credential = new ClientSecretCredential(TENANT_ID!, CLIENT_ID!, CLIENT_SECRET!);

  return Client.init({
    authProvider: async (done) => {
      try {
        const token = await credential.getToken("https://graph.microsoft.com/.default");
        done(null, token?.token ?? null);
      } catch (error) {
        done(error as Error, null);
      }
    },
  });
}

const graph = buildGraphClient();

async function resolveSiteId(): Promise<string> {
  if (SHAREPOINT_SITE_ID) return SHAREPOINT_SITE_ID;
  const safePath = CMS_SITE_PATH!.startsWith("/") ? CMS_SITE_PATH! : `/${CMS_SITE_PATH!}`;
  const site = await graph.api(`/sites/${CMS_SITE_HOSTNAME}:${safePath}`).header("Prefer", "apiversion=2.1").get();
  if (!site?.id) {
    throw new Error(`No se pudo resolver el site de SharePoint: ${CMS_SITE_HOSTNAME}${safePath}`);
  }
  return String(site.id);
}

async function fetchAllItems<T extends Record<string, unknown>>(
  listId: string,
  fields?: readonly string[],
): Promise<Array<GraphItem<T>>> {
  const siteId = await resolveSiteId();
  const expand = fields?.length ? `fields($select=${fields.join(",")})` : "fields";
  const items: Array<GraphItem<T>> = [];
  let next: string | null = `/sites/${siteId}/lists/${listId}/items?$top=999&$expand=${expand}`;

  while (next) {
    const response = await graph.api(next).header("Prefer", "apiversion=2.1").get();
    for (const item of response.value || []) {
      items.push(item);
    }
    next = response["@odata.nextLink"] || null;
  }

  return items;
}

function finalizeCatalog(categories: CategoryDto[], products: ProductDto[]): void {
  const categoriesBySlug = new Map<string, CategoryDto>();

  for (const category of categories) {
    categoriesBySlug.set(category.slug, category);
  }

  for (const category of categories) {
    category.breadcrumbs = buildCategoryBreadcrumbs(category, categoriesBySlug);
    category.seo.hreflang = normalizeHreflang(category.seo.hreflang, category.seo.canonical);
    category.seo.schema = buildCategorySchemaGraph(category);
  }

  for (const product of products) {
    if (!product.categorySlug && product.categorySlugs.length > 0) {
      product.categorySlug = product.categorySlugs[0] || "";
    }

    product.breadcrumbs = buildProductBreadcrumbs(product, categoriesBySlug);
    product.seo.hreflang = normalizeHreflang(product.seo.hreflang, product.seo.canonical);
    product.seo.schema = buildProductSchemaGraph(product);
  }
}

function validateCatalog(categories: CategoryDto[], products: ProductDto[]): void {
  const seenPaths = new Map<string, string>();

  for (const category of categories) {
    if (!category.path.startsWith("/categorias")) {
      warn(`Categoría ${category.slug}: path inválido (${category.path}).`);
    }

    if (category.image.src && !/^(https?:\/\/|\/)/i.test(category.image.src)) {
      warn(`Categoría ${category.slug}: image.src no parece una URL válida (${category.image.src}).`);
    }

    const canonicalPath = pathFromUrlLike(category.seo.canonical);
    if (canonicalPath && canonicalPath !== category.path) {
      warn(`Categoría ${category.slug}: canonical y path no coinciden (${canonicalPath} !== ${category.path}).`);
    }

    for (const section of category.sections) {
      if (/^##+\s+/m.test(section.body)) {
        warn(`Categoría ${category.slug}: quedó un heading incrustado dentro de la sección ${section.id}.`);
      }
    }

    const owner = seenPaths.get(category.path);
    if (owner) {
      warn(`Ruta duplicada ${category.path} entre ${owner} y categoría:${category.slug}.`);
    } else {
      seenPaths.set(category.path, `categoría:${category.slug}`);
    }
  }

  for (const product of products) {
    if (!product.path.startsWith("/productos")) {
      warn(`Producto ${product.slug}: path inválido (${product.path}).`);
    }

    if (!product.categorySlug) {
      warn(`Producto ${product.slug}: CategorySlug vacío.`);
    }

    if (product.image.src && !/^(https?:\/\/|\/)/i.test(product.image.src)) {
      warn(`Producto ${product.slug}: image.src no parece una URL válida (${product.image.src}).`);
    }

    const canonicalPath = pathFromUrlLike(product.seo.canonical);
    if (canonicalPath && canonicalPath !== product.path) {
      warn(`Producto ${product.slug}: canonical y path no coinciden (${canonicalPath} !== ${product.path}).`);
    }

    for (const section of product.sections) {
      if (/^##+\s+/m.test(section.body)) {
        warn(`Producto ${product.slug}: quedó un heading incrustado dentro de la sección ${section.id}.`);
      }
    }

    if (product.breadcrumbs.length === 0) {
      warn(`Producto ${product.slug}: breadcrumbs vacíos.`);
    }

    const categoryExists = product.categorySlug
      ? categories.some((category) => category.slug === product.categorySlug)
      : false;

    if (product.categorySlug && !categoryExists) {
      warn(`Producto ${product.slug}: CategorySlug (${product.categorySlug}) no existe en categorías publicadas.`);
    }

    const owner = seenPaths.get(product.path);
    if (owner) {
      warn(`Ruta duplicada ${product.path} entre ${owner} y producto:${product.slug}.`);
    } else {
      seenPaths.set(product.path, `producto:${product.slug}`);
    }
  }
}

async function run(): Promise<void> {
  console.log("🔄 Sincronizando SharePoint -> cms/catalog.json\n");

  const [categoryItems, productItems] = await Promise.all([
    fetchAllItems<Record<string, unknown>>(SP_LIST_CATEGORIES_ID!, CATEGORY_FIELDS),
    fetchAllItems<Record<string, unknown>>(SP_LIST_PRODUCTS_ID!, PRODUCT_FIELDS),
  ]);

  console.log(`📦 SharePoint: ${categoryItems.length} categorías, ${productItems.length} productos`);

  const builtCategories = categoryItems.map(buildCategory).filter((item): item is CategoryDto => Boolean(item));
  const builtProducts = productItems.map(buildProduct).filter((item): item is ProductDto => Boolean(item));

  for (const item of builtCategories) {
    if (!item.path || !item.title) {
      warn(`Categoría incompleta: id=${item.id} slug=${item.slug} path=${item.path} title=${item.title}`);
    }
  }

  for (const item of builtProducts) {
    if (!item.path || !item.title) {
      warn(`Producto incompleto: id=${item.id} slug=${item.slug} path=${item.path} title=${item.title}`);
    }
  }

  const categories = builtCategories
    .filter((item) => item.isPublished)
    .sort((a, b) => safeLocaleCompare(a?.path, b?.path));

  const products = builtProducts
    .filter((item) => item.isPublished)
    .sort((a, b) => (a.order !== b.order ? a.order - b.order : safeLocaleCompare(a?.title, b?.title)));

  finalizeCatalog(categories, products);
  validateCatalog(categories, products);

  await fs.mkdir(path.resolve("cms"), { recursive: true });

  const catalog: SyncCatalog = {
    generatedAt: new Date().toISOString(),
    categories,
    products,
  };

  await fs.writeFile(path.resolve("cms/catalog.json"), JSON.stringify(catalog, null, 2), "utf8");

  const routes = uniq([...categories.map((item) => item.path), ...products.map((item) => item.path)]).sort((a, b) =>
    safeLocaleCompare(a, b),
  );
  await fs.writeFile(path.resolve("cms/routes.json"), JSON.stringify(routes, null, 2), "utf8");

  const searchIndex = [
    ...categories.map((item) => ({
      type: "categoria",
      slug: item.slug,
      title: item.title,
      path: item.path,
      keywords: item.seo.keywords,
      searchTerms: item.seo.searchTerms || [],
    })),
    ...products.map((item) => ({
      type: "producto",
      slug: item.slug,
      title: item.title,
      path: item.path,
      keywords: item.seo.keywords,
      searchTerms: item.seo.searchTerms || [],
    })),
  ];

  await fs.writeFile(path.resolve("cms/search-index.json"), JSON.stringify(searchIndex, null, 2), "utf8");

  console.log("\n✅ Generados:");
  console.log("   cms/catalog.json");
  console.log("   cms/routes.json");
  console.log("   cms/search-index.json");

  if (warnings.length > 0) {
    console.log(`\n⚠️ Validaciones (${warnings.length}):`);
    for (const message of warnings) console.log(`   - ${message}`);
  } else {
    console.log("\n✅ Sin warnings de validación");
  }
}

run().catch((error) => {
  console.error("❌ Error durante la sincronización:");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
